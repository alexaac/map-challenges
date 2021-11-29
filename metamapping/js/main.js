let imgNames = [];
const imgDiv = document.getElementById('mps-inline-block');

// Get the data
d3.json('../data/categories.json').then(function (data) {
  console.log(data);

  data.forEach((elem, i) => {
    if (elem.parent) {
      const a = document.createElement('a');
      a.href = `https://maptheclouds.com/playground/30-day-map-challenge/${elem.name}/`;
      const img = document.createElement('img');
      img.src = `./data/${i + 1}_${elem.name}_meta.png`;
      img.className = 'post-img';
      img.title = elem.name;
      img.alt = elem.name;

      a.appendChild(img);
      imgDiv.appendChild(a);
    }
  });
});
