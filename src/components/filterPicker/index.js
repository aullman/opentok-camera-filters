require('./filterPicker.css');

module.exports = (filter, filters, appendTo) => {
  const changeFilter = f => {
    filter.change(filters[f]);
  };

  const selector = document.createElement('div');
  selector.className = 'filterPicker';
  let f;
  for (f of Object.keys(filters)) {
    const option = document.createElement('div');
    option.className = 'filterOption';
    const span = document.createElement('span');
    span.innerHTML = f;
    option.appendChild(span);
    option.addEventListener('click', changeFilter.bind(this, f));
    selector.appendChild(option);
  }
  appendTo.appendChild(selector);
};
