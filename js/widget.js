/* widjet.js
 * ---------
 * Search widget.
 *
 * Author: Code for Africa
 * URL: https://codeforafrica.org/
 * License: MIT
 */

var SearchWidget = {
  fn: {}
};

$(document).ready(function() {
  SearchWidget.fn.load_data();

  $('.widget input').keypress(function(e) {
    if (e.which == 13) {
      SearchWidget.fn.search();
    }
  });

  $('.widget button').click(function() {
    SearchWidget.fn.search();
  });

});

SearchWidget.fn.load_data = function() {

  // Create index
  SearchWidget.index = lunr(function() {
    // boost increases the importance of words found in this field
    this.field('suburb', { boost: 3 });
    this.field('erfnr', { boost: 10 });
    this.field('owner', { boost: 2 });
    this.field('category');
    this.field('address', { boost: 5 });
    // the id
    this.ref('id');
  });

  SearchWidget.fn.load_data_remote();

};

SearchWidget.fn.load_data_remote = function () {
  var data = $.getJSON('/js/data.json');
  data.then(function(response) {

    SearchWidget.data = response;

    $.each(SearchWidget.data, function(index, value) {
      SearchWidget.index.add({
        id: index,
        suburb: value.suburb,
        erfnr: value.erfnr,
        owner: value.owner,
        category: value.category,
        address: value.address
      });
    });

    SearchWidget.fn.search_examples();
    SearchWidget.fn.search_enable();

    // pym.js
    if (typeof pymChild !== 'undefined') { pymChild.sendHeight(); }
  });
}


SearchWidget.fn.search_examples = function() {
  var search_examples = '';
  for (var i = 5; i >= 0; i--) {
    var random_id = Math.floor(Math.random() * SearchWidget.data.length) + 1;
    var property = SearchWidget.data[random_id - 1];
    search_examples += '<a onclick="javascript:SearchWidget.fn.search_example(\'' + property.address + '\');">';
    search_examples += property.address + '</a>, ';
  }
  search_examples = search_examples.substring(0, search_examples.length - 2);
  $('.widget p.examples span').html(search_examples);
};

SearchWidget.fn.search_example = function(query) {
  $('.widget input').focus();
  $('.widget input').val(query);
  SearchWidget.fn.search(true);
};

SearchWidget.fn.search_enable = function() {
  $('.widget button').html('<i class="fa fa-btn fa-search"></i>');

  $('.widget input').prop('disabled', false);
  $('.widget button').prop('disabled', false);
};

SearchWidget.fn.search = function(is_example=false) {
  var query = $('.widget input').val();
  var results = SearchWidget.index.search(query);

  var results_html = '';
  $.each(results, function(index, value) {
    var property = SearchWidget.data[value.ref];
    results_html += '<li class="list-group-item">';
    results_html += '<p>' + property.address + '</p>';
    results_html += '<small><strong>Owner:</strong> ' + property.owner + '</small><br/>';
    results_html += '<small><strong>Category:</strong> ' + property.category + '</small><br/>';
    results_html += '<small><strong>Suburb:</strong> ' + property.suburb + '</small><br/>';
    results_html += '<small><strong>Erf No:</strong> ' + property.erfnr + '</small><br/>';
    results_html += '<small><strong>Size:</strong> ' + property.size_m2 + ' m<sup>2</sup></small><br/>';
    results_html += '<small><strong>Market Value:</strong> ZAR ' + numberWithCommas(property.market_value) + '</small><br/>';
    results_html += '</li>';
  });

  if (results.length === 0) {
    results_html = '<p class="text-center"><em>No results found for "' + query + '"</em></p>';
  }

  $('.widget .results-list').html(results_html);

  $('.results').removeClass('hidden');

  // pym.js
  if (typeof pymChild !== 'undefined') { pymChild.sendHeight(); }

  // send google analytics event
  var ga_event_action = 'search';
  if (is_example) { var ga_event_action = 'search:example'; }
  ga('send', 'event', 'Search', ga_event_action, query);

};
