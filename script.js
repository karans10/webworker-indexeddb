const webWorker = new Worker('./worker.js');
webWorker.onmessage = function (event) {
    const data = event.data;

    switch (data.type) {
        case ('db'): {
            logger(data);
            readAll();
            break;
        }
        case ('error'): {
            logger(data);
            break;
        }
        case ('add'): {
            logger(data);
            updateList(data.todo);
            break;
        }
        case ('delete'): {
            let todoElm = document.getElementById(`todo${data.todo}`);
            let list = document.getElementById("todos");
            list.removeChild(todoElm);
            logger(data);
            break;
        }
        case ('update'): {
            // not required
            let todo = data.todo;
            let todoElm = document.getElementById(`cbx${todo.id}`);
            if(todo.isDone) {
                todoElm.setAttribute("checked", "");
            }
            else {
                todoElm.removeAttribute("checked");
            }
            logger(data);
            break;
        }
        case ('readAll'): {
            let list = document.getElementById("todos");
            list.innerHTML = "";
            data.todos.forEach((todo) => {
               createTodoElement(todo, list);
            });
            logger(data);
            break;
        }

    }
};

function addTodo() {
    webWorker.postMessage({ type: 'add', value: document.getElementById('newTodo').value });
    document.getElementById('newTodo').value = ''
}

function readAll() {
    webWorker.postMessage({ type: 'readAll' });
}

function updateTodo(id) {
    webWorker.postMessage({ type: 'update', value: id });
}

function deleteTodo(id) {
    webWorker.postMessage({ type: 'delete', value: id });

}


function updateList(todo) {
    let list = document.getElementById("todos");
    createTodoElement(todo, list);

}

function createTodoElement(todo, list) {
    let todoElm = document.createElement('li');
                todoElm.setAttribute("id", `todo${todo.id}`);
                todoElm.innerHTML = `
                        <input id="cbx${todo.id}"type="checkbox" onclick="updateTodo(${todo.id})">
                            ${todo.value} 
                            <button id="btn${todo.id}" onclick="deleteTodo(${todo.id})" type="button" class="close" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                </div>`
                list.appendChild(todoElm);
                if (todo.isDone) {
                    document.getElementById(`cbx${todo.id}`).setAttribute("checked", "");
                }
}

function logger(data) {
    console.log(data.msg)
}

webWorker.postMessage({ type: 'init' });