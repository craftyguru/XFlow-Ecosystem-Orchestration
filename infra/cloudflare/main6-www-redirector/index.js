export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    const apexByWwwHost = {
      "www.xflowx.com": "xflowx.com",
      "www.rataify.com": "rataify.com",
      "www.audaix.com": "audaix.com",
      "www.wordgeni.com": "wordgeni.com",
      "www.crevux.com": "crevux.com",
    };

    const apexHost = apexByWwwHost[host];
    if (!apexHost) {
      return new Response("Not found", { status: 404 });
    }

    url.hostname = apexHost;
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  },
};
