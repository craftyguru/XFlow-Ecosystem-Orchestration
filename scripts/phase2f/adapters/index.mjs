import { authAdapter } from "./auth-adapter.mjs";
import { xflowAdapter } from "./xflow-adapter.mjs";
import { verixetAdapter } from "./verixet-adapter.mjs";
import { rataifyAdapter } from "./rataify-adapter.mjs";
import { audaixAdapter } from "./audaix-adapter.mjs";
import { crevuxAdapter } from "./crevux-adapter.mjs";
import { wordgeniAdapter } from "./wordgeni-adapter.mjs";

export const adapters = Object.freeze([
  authAdapter,
  xflowAdapter,
  verixetAdapter,
  rataifyAdapter,
  audaixAdapter,
  crevuxAdapter,
  wordgeniAdapter,
]);
