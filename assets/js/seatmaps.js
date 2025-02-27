
const fpPromise = import('https://fpcdn.io/v3/zw0y41RkzgTSnHArtryn')
  .then(fp => fp.load())
  .catch(err => console.log(err));

async function getVisitorId() {
  const fp = await fpPromise;
  if (fp) {
    try {
      const result = await fp.get();
      return result.visitorId;
    } catch (err) {
      console.log(err);
      return null;
    }
  } else {
    return null;
  }
}

var app = new Vue({
  el: "#app",
  data: {
    query: {
      from: '',
      to: '',
      date: moment().format('YYYY-MM-DD'),
      flight: '',
      cabin: 'economy',
    },
    loading: false,
    seatmap: null,
    layout: null,
    error: null,
    quotaReached: false,
  },
  created() {
    this.load();
  },
  methods: {
    load() {
      var hash = window.location.hash.slice(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        this.query = Object.assign(this.query, {
          from: params.get('from'),
          to: params.get('to'),
          date: params.get('date'),
          flight: params.get('flight'),
          cabin: params.get('cabin'),
        });
        this.search();
      }
    },
    search() {
      this.loading = true;
      getVisitorId().then(visitorId => {
        window.location.hash = $.param(this.query);
        var query = Object.assign({}, this.query, { visitorId });
        var qs = $.param(query);
        var endpoint = window.location.hostname == 'localhost' ? 'http://localhost:3000' :'https://awardfares.com';
        $.getJSON(endpoint + '/api/seatmap.json?' + qs, (body) => {
          this.loading = false;
          this.error = null;
          this.seatmap = body;
        }).fail((resp) => {
          if (resp.status == 429) {
            this.quotaReached = true;
            this.error = null;
          } else {
            this.quotaReached = false;
            this.error = resp.responseJSON?.error || resp.responseJSON?.errorMessage || resp.responseText || 'Seat map not available';
          }
          this.loading = false;
          this.seatmap = null;
        });
      });
    }
  },
});