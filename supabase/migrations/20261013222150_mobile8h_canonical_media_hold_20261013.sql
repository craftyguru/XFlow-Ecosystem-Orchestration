-- Recovered from production supabase_migrations.schema_migrations statement bodies.
-- Semicolon terminators restored between ledger statements.
-- Version: 20261013222150; name: mobile8h_canonical_media_hold_20261013; statement-join MD5: 186a4addbee1304efe8fb1a729a74149

CREATE TABLE "mobile8h_credit_holds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operation_id" uuid NOT NULL,
	"reservation_transaction_id" text NOT NULL,
	"release_transaction_id" text,
	"state" text NOT NULL,
	"fence_id" uuid,
	"provider_receipt" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mobile8h_credit_holds_operation_id_unique" UNIQUE("operation_id"),
	CONSTRAINT "mobile8h_credit_holds_reservation_transaction_id_unique" UNIQUE("reservation_transaction_id"),
	CONSTRAINT "mobile8h_credit_holds_release_transaction_id_unique" UNIQUE("release_transaction_id"),
	CONSTRAINT "mobile8h_credit_hold_state" CHECK ("mobile8h_credit_holds"."state" in ('reserved','dispatched','settled','quarantined','released'))
);
--> statement-breakpoint
CREATE TABLE "mobile8h_credit_permits" (
	"operation_id" uuid PRIMARY KEY NOT NULL,
	"request_digest" text NOT NULL,
	"actor_id" uuid NOT NULL,
	"crevux_workspace_id" uuid NOT NULL,
	"canonical_workspace_id" text NOT NULL,
	"balance_id" uuid NOT NULL,
	"pool_user_id" text,
	"credit_charge" bigint NOT NULL,
	"idempotency_key" text NOT NULL,
	"approval_reference" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"release_enabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "mobile8h_credit_permit_digest" CHECK ("mobile8h_credit_permits"."request_digest" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "mobile8h_credit_permit_charge" CHECK ("mobile8h_credit_permits"."credit_charge" > 0)
);
--> statement-breakpoint
ALTER TABLE "mobile8h_credit_holds" ADD CONSTRAINT "mobile8h_credit_holds_operation_id_mobile8h_credit_permits_operation_id_fk" FOREIGN KEY ("operation_id") REFERENCES "public"."mobile8h_credit_permits"("operation_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile8h_credit_holds" ADD CONSTRAINT "mobile8h_credit_holds_reservation_transaction_id_credit_transactions_id_fk" FOREIGN KEY ("reservation_transaction_id") REFERENCES "public"."credit_transactions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile8h_credit_holds" ADD CONSTRAINT "mobile8h_credit_holds_release_transaction_id_credit_transactions_id_fk" FOREIGN KEY ("release_transaction_id") REFERENCES "public"."credit_transactions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile8h_credit_permits" ADD CONSTRAINT "mobile8h_credit_permits_canonical_workspace_id_workspaces_id_fk" FOREIGN KEY ("canonical_workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile8h_credit_permits" ADD CONSTRAINT "mobile8h_credit_permits_balance_id_credit_balances_id_fk" FOREIGN KEY ("balance_id") REFERENCES "public"."credit_balances"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile8h_credit_permits" ADD CONSTRAINT "mobile8h_credit_permits_pool_user_id_users_id_fk" FOREIGN KEY ("pool_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "mobile8h_credit_permit_key_unique" ON "mobile8h_credit_permits" USING btree ("actor_id","crevux_workspace_id","idempotency_key");
--> statement-breakpoint
-- Reviewed generator delta: only the two MOBILE-8H bookkeeping tables above.
-- Offline generation lacked an earlier usable snapshot and proposed unrelated recreation; rejected.
ALTER TABLE public.mobile8h_credit_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile8h_credit_holds ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mobile8h_credit_permits,public.mobile8h_credit_holds FROM PUBLIC;
--> statement-breakpoint
CREATE FUNCTION public.mobile8h_credit_permit_immutable() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF (to_jsonb(NEW)-ARRAY['active','release_enabled'])<>(to_jsonb(OLD)-ARRAY['active','release_enabled']) THEN
  RAISE EXCEPTION 'MOBILE8H_IMMUTABLE_CREDIT_APPROVAL';
 END IF; RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER mobile8h_credit_permit_immutable BEFORE UPDATE ON public.mobile8h_credit_permits
 FOR EACH ROW EXECUTE FUNCTION public.mobile8h_credit_permit_immutable();
--> statement-breakpoint
CREATE FUNCTION public.mobile8h_canonical_credit_action(
 p_action text,p_operation uuid,p_digest text,p_actor uuid,p_workspace uuid,p_key text,p_extra jsonb)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.mobile8h_credit_permits; h public.mobile8h_credit_holds; b public.credit_balances;
 debit_id public.credit_transactions.id%TYPE; reversal_id public.credit_transactions.id%TYPE; source_metadata jsonb;
BEGIN
 IF p_action IS NULL OR p_action NOT IN ('reserve','dispatch','settle','get','quarantine','release') THEN RAISE EXCEPTION 'MOBILE8H_INVALID_CREDIT_ACTION'; END IF;
 SELECT * INTO p FROM public.mobile8h_credit_permits WHERE operation_id=p_operation FOR UPDATE;
 IF NOT FOUND OR (p.request_digest=p_digest AND p.actor_id=p_actor AND p.crevux_workspace_id=p_workspace AND
   p.idempotency_key=p_key) IS NOT TRUE THEN RAISE EXCEPTION 'MOBILE8H_CREDIT_SCOPE_MISMATCH'; END IF;
 SELECT * INTO b FROM public.credit_balances WHERE id=p.balance_id FOR UPDATE;
 IF NOT FOUND OR (b.workspace_id::text=p.canonical_workspace_id AND b.user_id::text IS NOT DISTINCT FROM p.pool_user_id AND
   b.app_key='ecosystem' AND b.environment='live' AND b.credit_key='media_image_credits') IS NOT TRUE THEN
  RAISE EXCEPTION 'MOBILE8H_CANONICAL_POOL_MISMATCH'; END IF;
 SELECT * INTO h FROM public.mobile8h_credit_holds WHERE operation_id=p_operation FOR UPDATE;
 IF p_action='reserve' AND NOT FOUND THEN
  IF NOT p.active OR p.expires_at<=clock_timestamp() OR (b.expires_at IS NOT NULL AND b.expires_at<=clock_timestamp()) OR
    p.credit_charge<=0 OR b.balance<p.credit_charge THEN RAISE EXCEPTION 'MOBILE8H_CANONICAL_CREDITS_UNAVAILABLE'; END IF;
  source_metadata:=jsonb_build_object('operation_digest',p.request_digest,'qa_actor',p.actor_id,
    'crevux_workspace',p.crevux_workspace_id,'hold_semantics','debit_at_reservation_no_second_debit_on_settlement');
  INSERT INTO public.credit_transactions(workspace_id,app_key,environment,user_id,credit_balance_id,credit_key,
    transaction_type,delta,reason,reference_type,reference_id,metadata)
   VALUES(b.workspace_id::text,'ecosystem','live',b.user_id::text,b.id::text,'media_image_credits','debit',-p.credit_charge,
    'mobile8h_diagnostic_hold','mobile8h_diagnostic', 'mobile8h:reserve:'||p.operation_id::text,source_metadata)
   RETURNING id INTO debit_id;
  UPDATE public.credit_balances SET balance=balance-p.credit_charge,updated_at=clock_timestamp()
   WHERE id=b.id AND balance>=p.credit_charge;
  IF NOT FOUND THEN RAISE EXCEPTION 'MOBILE8H_CANONICAL_CREDITS_UNAVAILABLE'; END IF;
  INSERT INTO public.mobile8h_credit_holds(operation_id,reservation_transaction_id,state)
   VALUES(p.operation_id,debit_id,'reserved') RETURNING * INTO h;
 ELSIF h.id IS NULL THEN RAISE EXCEPTION 'MOBILE8H_HOLD_NOT_FOUND';
 END IF;
 IF p_action='dispatch' THEN
  IF h.fence_id IS NOT NULL AND h.fence_id IS DISTINCT FROM (p_extra->>'fenceId')::uuid THEN RAISE EXCEPTION 'MOBILE8H_FENCE_CONFLICT'; END IF;
  IF h.state='reserved' THEN
   IF NOT p.active OR p.expires_at<=clock_timestamp() OR (b.expires_at IS NOT NULL AND b.expires_at<=clock_timestamp()) OR
     (p_extra->>'fenceId' ~ '^[0-9a-f-]{36}$') IS NOT TRUE THEN RAISE EXCEPTION 'MOBILE8H_DISPATCH_AUTHORITY_UNAVAILABLE'; END IF;
   UPDATE public.mobile8h_credit_holds SET state='dispatched',fence_id=(p_extra->>'fenceId')::uuid,updated_at=clock_timestamp()
    WHERE id=h.id RETURNING * INTO h;
  ELSIF h.state='dispatched' AND h.fence_id IS DISTINCT FROM (p_extra->>'fenceId')::uuid THEN
   RAISE EXCEPTION 'MOBILE8H_FENCE_CONFLICT';
  END IF;
 ELSIF p_action='settle' THEN
  IF h.fence_id IS DISTINCT FROM (p_extra->>'fenceId')::uuid THEN RAISE EXCEPTION 'MOBILE8H_FENCE_CONFLICT'; END IF;
  IF h.state='dispatched' THEN
   IF (jsonb_typeof(p_extra->'providerReceipt')='object' AND p_extra#>>'{providerReceipt,requestId}' IS NOT NULL AND
     p_extra->>'fenceId'=h.fence_id::text) IS NOT TRUE THEN RAISE EXCEPTION 'MOBILE8H_SETTLEMENT_RECEIPT_REQUIRED'; END IF;
   UPDATE public.mobile8h_credit_holds SET state='settled',provider_receipt=p_extra->'providerReceipt',updated_at=clock_timestamp()
    WHERE id=h.id RETURNING * INTO h;
  ELSIF h.state='settled' AND h.provider_receipt IS DISTINCT FROM p_extra->'providerReceipt' THEN
   RAISE EXCEPTION 'MOBILE8H_SETTLEMENT_CONFLICT';
  END IF;
 ELSIF p_action='quarantine' THEN
  IF h.state IN ('reserved','dispatched') THEN
   UPDATE public.mobile8h_credit_holds SET state='quarantined',provider_receipt=p_extra->'providerReceipt',updated_at=clock_timestamp()
    WHERE id=h.id RETURNING * INTO h;
  END IF;
 ELSIF p_action='release' THEN
  -- Explicit operator authority only; no release/refund from automatic error handlers.
  IF h.state IN ('reserved','quarantined') AND h.fence_id IS NULL AND NOT p.active AND p.release_enabled THEN
   INSERT INTO public.credit_transactions(workspace_id,app_key,environment,user_id,credit_balance_id,credit_key,
     transaction_type,delta,reason,reference_type,reference_id,metadata)
    VALUES(b.workspace_id::text,'ecosystem','live',b.user_id::text,b.id::text,'media_image_credits','reversal',p.credit_charge,
     'mobile8h_confirmed_pre_dispatch_release','mobile8h_diagnostic','mobile8h:release:'||p.operation_id::text,
     jsonb_build_object('operation_digest',p.request_digest,'reservation_transaction_id',h.reservation_transaction_id))
    RETURNING id INTO reversal_id;
   UPDATE public.credit_balances SET balance=balance+p.credit_charge,updated_at=clock_timestamp() WHERE id=b.id;
   UPDATE public.mobile8h_credit_holds SET state='released',release_transaction_id=reversal_id,updated_at=clock_timestamp()
    WHERE id=h.id RETURNING * INTO h;
  ELSIF h.state<>'released' THEN RAISE EXCEPTION 'MOBILE8H_RELEASE_NOT_APPROVED'; END IF;
 ELSIF p_action NOT IN ('reserve','get') THEN RAISE EXCEPTION 'MOBILE8H_INVALID_CREDIT_ACTION'; END IF;
 RETURN jsonb_build_object('schemaVersion','mobile8h-canonical-credit-receipt/v1','holdId',h.id,'operationId',p.operation_id,
   'requestDigest',p.request_digest,'actorId',p.actor_id,'workspaceId',p.crevux_workspace_id,'canonicalWorkspaceId',b.workspace_id,
   'balanceId',b.id,'poolUserId',b.user_id,'creditKey','media_image_credits','creditCharge',p.credit_charge::text,
   'reservationTransactionId',h.reservation_transaction_id,'releaseTransactionId',h.release_transaction_id,
   'state',h.state,'fenceId',h.fence_id,'providerReceipt',h.provider_receipt);
END $$;
--> statement-breakpoint
DO $$ DECLARE r text; BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='mobile8h_accounting_runtime') THEN
  CREATE ROLE mobile8h_accounting_runtime NOLOGIN NOSUPERUSER NOBYPASSRLS;
 END IF;
 REVOKE ALL ON FUNCTION public.mobile8h_canonical_credit_action(text,uuid,text,uuid,uuid,text,jsonb) FROM PUBLIC;
 REVOKE ALL ON FUNCTION public.mobile8h_credit_permit_immutable() FROM PUBLIC;
 FOR r IN SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role','mobile8h_accounting_runtime') LOOP
  EXECUTE format('REVOKE ALL ON public.mobile8h_credit_permits,public.mobile8h_credit_holds FROM %I',r);
  EXECUTE format('REVOKE ALL ON FUNCTION public.mobile8h_canonical_credit_action(text,uuid,text,uuid,uuid,text,jsonb) FROM %I',r);
 END LOOP;
 REVOKE ALL ON public.credit_balances,public.credit_transactions FROM mobile8h_accounting_runtime;
 GRANT USAGE ON SCHEMA public TO mobile8h_accounting_runtime;
 GRANT EXECUTE ON FUNCTION public.mobile8h_canonical_credit_action(text,uuid,text,uuid,uuid,text,jsonb) TO mobile8h_accounting_runtime;
END $$;

