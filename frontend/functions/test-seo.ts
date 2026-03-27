export const onRequest: PagesFunction = async (context) => {
  return new HTMLRewriter()
    .on("title", {
      element(element) {
        element.setInnerContent("TEST SEO WORKS!");
      }
    })
    .transform(new Response("<html><head><title>Old Title</title></head><body><h1>Hello</h1></body></html>", {
      headers: { "content-type": "text/html" }
    }));
};
