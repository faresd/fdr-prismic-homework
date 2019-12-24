module.exports = {

  apiEndpoint: 'https://fdr-testing-prismicio.cdn.prismic.io/api/v2',
  linkResolver: function(doc, ctx) {
    if (doc.type == 'page') {
        return '/' + doc.uid;
    }
    return '/';
  }
};
