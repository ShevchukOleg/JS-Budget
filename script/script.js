/**
 * Добавление статти бюджета
 * Удаление статтьи бюджета
 * Подсчет результата общего и по статтьям
 * 
 */

 /**
  * каждая записть в масиве представленна в виде объекта с ключами: 
  * id = "type-id_number", 
  * description = item_description,
  * value = item_value
  */

let storage = {
  income_items: [],
  expanses_itsems: []
}

// UI Elements
const input_description = document.querySelector('input.add_description');
const input_value = document.querySelector('input.add_value');
const input_submit = document.querySelector('button[type = "submit"]');
const budget_result = document.querySelector('div.budget_value');
const budget_income = document.querySelector('div.budget_income');
const budget_expenses = document.querySelector('div.budget_expenses');
const income_list = document.querySelector('div.income_list');
const expenses_list = document.querySelector('div.expenses_list');
const curent_month = document.querySelector('span.budget_title--month');
const selected_type = document.querySelector('select.add_type');
let cash_flow;
const table = document.querySelector('div[data-id="budget_table"]');

// Calculation results
let totalIncome = 0;
let totalExpanses = 0;

//Events
/**
 * обработчик удаления статьи бюджета
 */
table.addEventListener('click', (e) => {
  if (e.target.dataset.class == "remove"){
    const id = e.target.closest(".item").dataset.id;
    delete_budgetItem(id);
    totalIncome = sumByBudgetItem(storage.income_items);
    totalExpanses = sumByBudgetItem(storage.expanses_itsems);
    id[0] == 'i' ? budgetResult('+') :  budgetResult('-');
  }
})

/**
 * Обработчик нажатия на кнопку подтверждения
 */
input_submit.addEventListener('click', () => {
  if(!input_description.value || !input_value.value) return alert("Введите все данные!");

  add_new_budgetItem(input_description.value, input_value.value);
  input_description.value = '';
  input_value.value = '';
})

/**
 * Обработчик изменения типа статьи бюджета
 */
selected_type.addEventListener("change", (e) => {
  e.preventDefault();
  cash_flow = selected_type.options.selectedIndex

  if (cash_flow){
    selected_type.classList.add("red-focus");
    input_description.classList.add("red-focus");
    input_value.classList.add("red-focus");
  } else {
    selected_type.classList.remove("red-focus");
    input_description.classList.remove("red-focus");
    input_value.classList.remove("red-focus");
  } 
});


// Генератор id  для записи статьи бюджета
/**
 * generate_id - создает произвольную строку 
 * @returns {string} - новый id
 */
const generate_id = () => {
  const words = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
  let str = "";
  let id;

  for (let i = 0; i < 5; i++) {
      str += words[Math.floor(Math.random() * words.length)]; 
  };

  selected_type.options.selectedIndex === 0 ? id = "income-" + str : id = "expense-" + str;
  return id;
}

//Функционал добавления данных
/**
 * add_new_budgetItem - общая функция создания новой статьи бюджета
 * @param {Text} description - описание статьи бюджета
 * @param {Number} value - денежная сумма
 */
const add_new_budgetItem = (description, value) => {
  if(!description) return alert("Введите описание!");

  if (!value || isNaN(value)) return alert("Введите  коректную сумму!");

  const new_budgetItem = {id: generate_id(), description, value };

  if(!cash_flow){
    storage.income_items.push(new_budgetItem);
    totalIncome = sumByBudgetItem(storage.income_items);
    budgetResult('+');
  } else {
    storage.expanses_itsems.push(new_budgetItem);
    totalExpanses = sumByBudgetItem(storage.expanses_itsems);
    budgetResult('-');
  }

  add_new_item_template(new_budgetItem);

  return storage.income_items, storage.expanses_itsems;
}
/**
 * add_new_item_template - вставка в документ сгенерированного кода
 * @param {object} item - объект с описание статьи элемента бюджета
 */
const add_new_item_template = item => {
  const template = create_budgetItem_template(item);

  if (!cash_flow){
    income_list.insertAdjacentHTML('beforeend', template);
  } else {
    expenses_list.insertAdjacentHTML('beforeend', template);
  }
}
/**
 * create_budgetItem_template - опционально создает необходимый для вставки HTML код
 * @param {object} item - объект с описание статьи элемента бюджета
 */
const create_budgetItem_template = item => {
  let sign = '';

  if(!cash_flow){
    sign += "+";
  }else{
    sign += "-";
  }

  return `
        <div class="item clearfix" data-id="${item.id}">
          <div class="item_description">${item.description}</div>
          <div class="right clearfix">
              <div class="item_value">${sign} ${item.value}</div>
              <div class="item_delete">
                  <button class="item_delete--btn"><i class="ion-ios-close-outline" data-class = "remove"></i></button>
              </div>
          </div>
        </div>
  `;
}

// Функционал удаления данных

/**
 * удаление статьи бюжта по ее ID
 * @param {Text} id - идентификатор удаляемойстатьи бюджета
 * @returns void
 */
const delete_budgetItem = (id) => {
  if(!id) return alert("Ошибка, при попытке считывания ID");

  const areYouSure = confirm("Удалить статью бюджета?");

  if (!areYouSure) return;

  const check_id_in_expanses = storage.expanses_itsems.some(item =>item.id === id);
  const check_id_in_income = storage.income_items.some(item =>item.id === id);
  if(!check_id_in_expanses && !check_id_in_income) return alert("Передан неверный ID");

  storage.expanses_itsems = storage.expanses_itsems.filter(item => item.id !== id);
  storage.income_items = storage.income_items.filter(item => item.id !== id);

  delete_item_HTML(id);
  
  return storage.expanses_itsems, storage.income_items;
}
/**
 * delete_item_HTML - удаляет елемент бюджета из интерфейса
 * @param {*} id - идентификатор нудной строки
 */
const delete_item_HTML = id => {
  const deleted_item = document.querySelector(`div[data-id = ${id}]`);
  const deleted_item_parent = deleted_item.parentElement;
  deleted_item_parent.removeChild(deleted_item);
}

//Функционал расчета состояния бюджета
/**
 * sumByBudgetItem - универсальная функция расчетаитога по статьи бюджета
 * @param {Array} arr - масив объектов с елементами бюджета
 */
const sumByBudgetItem = (arr) => {
  let sum = 0;
  if(!!arr.length){
    for (let i = 0; i < arr.length; i++) {
      sum += +arr[i].value;
    }
  }

  return sum;
}

//Функционал отображения состояния бюджета
/**
 * budgetResult - расчет состояния бджета
 * @param {Text} budgetOperation - параметр определяющий расход или доход
 */
let budgetResult = (budgetOperation) =>{
budgetOperation == '+' ? document.querySelector('.budget_income--value').textContent = `+ ${Math.round(totalIncome*100)/100}`:
document.querySelector('.budget_expenses--value').textContent = `- ${Math.round(totalExpanses*100)/100}`;
let res = totalIncome - totalExpanses;
document.querySelector('.budget_value').textContent = `${Math.round(res*1000)/1000}`;
}
