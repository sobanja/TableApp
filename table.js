const selectData = document.getElementById("data-set");
const addBtn = document.getElementById("addBtn");
const addForm = document.getElementById("addForm");

const formContainer = document.getElementById("formContainer");
const filterInput = document.getElementById("filter-input");
const filterBtn = document.getElementById("filter-button");

const smallData =
  "http://www.filltext.com/?rows=32&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D";
const largeData =
  "http://www.filltext.com/?rows=1000&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&delay=3&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D";
const itemsPage = 50;

// Переменная для хранения загруженных данных
let data = [];
// Текущая страница
let currentPage = 1;
// Индекс начала данных на текущей странице
let startIndex = 0;
// Индекс конца данных на текущей странице
let endIndex = 0;
let sortKey = null;
let sortDirection = "asc";

addBtn.addEventListener("click", () => {
  formContainer.style.display = "block";
});

addForm.addEventListener("submit", (event) => {
  // предотвращается стандартное поведение формы,
  // что останавливает отправку формы и перезагрузку страницы.
  event.preventDefault();

  // Данные формы извлекаются с помощью конструктора FormData,
  // использует элемент addForm в качестве аргумента
  const formData = new FormData(addForm);
  // Создается объект newEntry на основе данных формы
  const newEntry = {};

  // Затем данные формы преобразуются в объект с именем newEntry.
  for (let pair of formData.entries()) {
    newEntry[pair[0]] = pair[1];
  }

  // Создается объект newEntry на основе данных формы
  // объект добавляется в начало массива data
  // также добавл доп поля
  data.unshift({ ...newEntry, address: "", description: "" });
  // вызов ф для обновления таблицы новыми данными
  buildTable(data);

  // после добавл форма сбрасывается в исх состояние
  // и контейнер скрывается
  addForm.reset();
  formContainer.style.display = "none";
});

// при изменении значения проверяется какое оно именно
// в зависимости от него вызыв функ, которая вып запрос к указ url
selectData.addEventListener("change", () => {
  if (selectData.value === "small") {
    loadData(smallData);
  } else {
    loadData(largeData);
  }
});

const loadData = (url) => {
  // отпр запрос по указ url
  fetch(url)
    // получаем объект promise с результатом и переводим в json
    .then((response) => response.json())
    .then((responseData) => {
      // присваиваем данные в переменную data
      data = responseData;
      // вызываем функ обновляющие интерфейс
      updateTable();
      updatePagination();
    })
    .catch((error) => console.error("Error loading data:", error));
};

// функ создает и заполняет таблицу на основе переданных данных
const buildTable = (data) => {
  //получаем таблицу
  const tableContainer = document.getElementById("table-container");
  // очищаем содержимое
  tableContainer.innerHTML = "";

  // создаем таблицу, содерж строки и ячейки
  const table = document.createElement("table");
  // добавл эту таблицу в контейнер
  tableContainer.appendChild(table);

  const headerRow = document.createElement("tr");
  table.appendChild(headerRow);

  // для каждого ключа (заголовка) данных создается ячейка th и span
  Object.keys(data[0]).forEach((key) => {
    const th = document.createElement("th");
    const arrow = document.createElement("span");
    arrow.classList.add("arrow");


    // если ключ соотв текущ ключу сортировки, то добавл символ такой-то
    if (key === sortKey) {
      if (sortDirection === "asc") {
        arrow.textContent = "▼";
      } else {
        arrow.textContent = "▲";
      }
    }
    th.textContent = key;
    // при клике на ячейку заголовка вызыв функ
    th.addEventListener("click", () => {
      // сортирует ключи по возрастанию
      sortTable(key);
    });
    th.appendChild(arrow);
    headerRow.appendChild(th);
  });
  // заполнение данных в таблице
  // итерация по строкам (иденксам) от start - end
  for (let i = startIndex; i < data.length; i++) {

    // для каждой строки данных созд элем cстроки tr и доб в таблицу
    const rowData = data[i]; console.log(rowData); 
    const row = document.createElement("tr");
    row.classList.add("data");
    table.appendChild(row);

    // для каждого знач в строке данных созд ячейка td
    Object.values(rowData).forEach((value) => {
      console.log(value);
      const cell = document.createElement("td");
      // если знач явл объектом, то знач объекта объед в строку (для адреса)
      if (typeof value === "object") {
        let address = "";
        const lastKey = Object.keys(value).pop();
        for (let key in value) {
          // если
          const comma = key === lastKey ? "" : ", ";
          address += value[key] + comma;
        }
        cell.textContent = address;
      } else {
        cell.textContent = value;
      }
      row.appendChild(cell);
    });
    // для каждой строки доб обраб клика
    row.addEventListener("click", () => {
      // при клике на строку выводится ее содерж
      console.log(rowData);
      viewData(rowData);
    });
  }
};

// 
const updateTable = () => {
  startIndex = (currentPage - 1) * itemsPage;
  if (data.length < 50) {
    endIndex = data.length;
  } else {
    endIndex = Math.min(startIndex + itemsPage, data.length);
  }
  if (sortKey) {
    const sortTable = sortData(data, sortKey, sortDirection);
    buildTable(sortTable);
  } else {
    buildTable(data);
  }
};

const updatePagination = () => {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(data.length / itemsPage);

  for (let i = 1; i <= totalPages; i++) {
      const pageLink = document.createElement('a');
      pageLink.textContent = i;
      pageLink.href = '#';
      pageLink.addEventListener('click', () => {
          currentPage = i;
          updateTable();
          updatePagination();
      });

      paginationContainer.appendChild(pageLink);
  }
};

const sortData = (data, key, direction) => {
  if (!key) {
      return data;
  }
  return data.sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];

      if (valueA < valueB) {
          return direction === 'asc' ? -1 : 1;
      } else if (valueA > valueB) {
          return direction === 'asc' ? 1 : -1;
      }
      return 0;
  })
}

const sortTable = (key) => {
  if (sortKey === key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
      sortKey = key;
      sortDirection = 'asc'
  }
  updateTable();
}

filterBtn.addEventListener('click', () => {
  const searchValue = filterBtn.value.trim().toLowerCase();

  if(searchValue !== '') {
      const filtredData = data.filter(item => {
          for(let key in item) {
              if(key === 'id' && item[key].toString().includes(searchValue)) {
                  return true;
              }
              if(typeof(item[key]) === 'string' && item[key].toLowerCase().includes(searchValue)) {
                  return true;
              }
          }
          return false;
      })
      buildTable(filtredData);
  } else {
      buildTable(data);
  }
});

filterBtn.addEventListener('keydown', event => {
  if(event.key === 'Enter') {
    filterBtn.click();
  }
})

const additionalInfo = document.getElementById('additionalInfo');
const viewData = (data) => {
  let info = '';
      Object.values(data).forEach(value => {
          if(data.id === 101) {
              info = `
                  User selected <b>${data.firstName} ${data.lastName}</b><br>
                  Description: <br>
                  <textarea>
                      ${data.description}
                  </textarea><br>
                  Residential address: <b>${data.address.streetAddress}</b><br>
                  City: <b>${data.address.city}</b><br>
                  Province/state: <b>${data.address.state}</b><br>
                  Index: <b>${data.address.zip}</b><br>
                  `;
              additionalInfo.innerHTML = info;
          }
      });
}
