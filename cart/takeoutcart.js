"use strict";

const menuArea = document.getElementById("menuarea");
const linkArea = document.getElementById("linkarea");

fetch("data/menudata.json")
  .then((response) => response.json())
  .then((data) => dataFilter(data))
  .then((data) => {
    buildMenu(data);
    buildLink(data);
  });

function dataFilter(data) {
  let newData = new Object();
  data.filter((obj) => {
    if (!newData[obj.class]) {
      newData[obj.class] = [];
      newData[obj.class].push(obj);
    } else {
      newData[obj.class].push(obj);
    }
  });
  return newData;
}

function buildLink(data) {
  let ul = document.createElement("ul");
  for (let key in data) {
    let li = document.createElement("li");
    li.innerText = data[key][0].linkname;
    li.dataset.link = key;
    if (key === "yamato") {
      li.classList.add("active");
    }
    ul.appendChild(li);
  }
  linkArea.appendChild(ul);
}

function buildMenu(data) {
  let outerfragment = document.createDocumentFragment();
  for (let key in data) {
    let div = document.createElement("div");
    div.classList.add(key);
    if (key === "yamato") {
      div.classList.add("active");
    }
    let innerfragment = document.createDocumentFragment();
    for (let menuObj of data[key]) {
      let dl = document.createElement("dl");
      dl.classList.add("menu");

      let dt = document.createElement("dt");
      dt.innerHTML = `${menuObj.name}<span>&yen;${comma(menuObj.price)}</span>`;

      let dd = document.createElement("dd");

      let input = document.createElement("input");
      input.setAttribute("type", "tel");
      input.setAttribute("name", "price");
      input.setAttribute("id", `menu${menuObj.number}`);
      input.setAttribute("maxlength", "4");
      input.classList.add("quantity-area");

      let button = document.createElement("button");
      button.classList.add("add-menus");
      button.setAttribute("type", "button");
      button.setAttribute("title", "カートに追加");
      button.dataset.name = menuObj.name;
      button.dataset.price = menuObj.price;
      button.dataset.id = `menu${menuObj.number}`;

      dd.appendChild(input);
      dd.appendChild(button);
      dl.appendChild(dt);
      dl.appendChild(dd);
      innerfragment.appendChild(dl);
    }
    div.appendChild(innerfragment);
    outerfragment.appendChild(div);
  }
  menuArea.append(outerfragment);
}
//*スライド機能------------------------------------------------------------------

linkArea.addEventListener("click", function (evt) {
  let target = evt.target;
  let data = target.dataset.link;
  let divs = [...menuArea.getElementsByTagName("div")];
  let links = [...linkArea.getElementsByTagName("li")];
  for (let div of divs) {
    if (div.classList.contains(data)) {
      div.classList.add("active");
      target.classList.add("active");
    } else {
      div.classList.remove("active");
    }
  }
  for (let link of links) {
    if (target === link) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  }
});

//*カート機能------------------------------------------------------------------

let bentos = new Object();
const bentosLen = document.querySelector(".bentos-length");

menuArea.addEventListener("click", function (evt) {
  let target = evt.target;
  if (target.classList.contains("add-menus")) {
    let data = target.dataset;
    let id = data.id;
    let quantity = _changeHarfSize(document.getElementById(id).value);
    let sub_total = data.price * quantity;

    if (quantity > 0) {
      bentos[id] = new Object();
      bentos[id] = {
        name: data.name,
        parice: data.price,
        quantity: quantity,
        sub_total: sub_total,
      };

      if (Object.keys(bentos).length > 0) {
        bentosLen.classList.remove("hide");
        bentosLen.innerText = Object.keys(bentos).length;
      }
    }
  }
});
//*クリア機能------------------------------------------------------------------

const clearBtn = document.getElementById("clear");

clearBtn.addEventListener("click", function(){
  for (let key in bentos) {
    delete bentos[key];
  }
  bentosLen.classList.add("hide");
  let quantityAreas = [...document.getElementsByClassName("quantity-area")];
  for(let area of quantityAreas){
    area.value = "";
  }
});

//*合計の画面------------------------------------------------------------------

const HTMLbody = document.body;
const totalBtn = document.getElementById("totalbtn");
let scrollposi = 0;
let getScrollTop = function (window) {
  var document;
  var body;
  return "pageYOffset" in window
    ? window.pageYOffset
    : (
        (document = window.document).documentElement ||
        (body = document.body).parentNode ||
        body
      ).scrollTop;
};

totalBtn.addEventListener("click", buildTotal);

function buildTotal() {
  const modalLayer = document.createElement("div");
  modalLayer.classList.add("modal-layer");

  let ul = document.createElement("ul");
  let total = 0;

  for (let key in bentos) {
    let li = document.createElement("li");
    li.innerHTML = `<span>${bentos[key].name}&nbsp;${
      bentos[key].quantity
    }個</span><span>&yen;${comma(bentos[key].sub_total)}</span>`;
    ul.appendChild(li);
    total += bentos[key].sub_total;
  }
  let div = document.createElement("div");
  div.classList.add("total-price");
  div.innerHTML = `合計:&yen;${comma(total)}`;

  let icon = document.createElement("span");
  icon.classList.add("close-icon");
  icon.innerHTML = closeIcon();
  icon.addEventListener("click", function () {
    modalLayer.remove();
  });

  modalLayer.appendChild(icon);
  modalLayer.appendChild(ul);
  modalLayer.appendChild(div);
  HTMLbody.appendChild(modalLayer);
}

function comma(num) {
  return num.toString().replace(/([0-9]+?)(?=(?:[0-9]{3})+$)/g, "$1,");
}

function closeIcon() {
  return '<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="times-circle" class="svg-inline--fa fa-times-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#ffffff" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"></path></svg>';
}

function _changeHarfSize(num) {
  return num.replace(/[０-９]/g,s => String.fromCharCode(s.charCodeAt(0) - 65248)).replace(/\D/g,'')
}
