let db;
let objectStore;

self.onmessage = function (event) {
    const data = event.data;

    switch (data.type) {
        case ('init'): {
            let request = indexedDB.open('todosDB', 4);

            request.onupgradeneeded = function (event) {
                let db = event.target.result;
                objectStore = db.createObjectStore("todos", { keyPath: "id" });
                self.postMessage({ type: 'db', msg: 'db upgraded' });
            };

            request.onsuccess = function (event) {
                db = event.target.result;
                self.postMessage({ type: 'db', msg: 'db connected' });
            }

            request.onerror = errorHandler
            break;
        }
        case ('add'): {
            add(data);
            break;
        }
        case ('readAll'): {
            readAll();
            break;
        }
        case ('delete'): {
            deleteTodo(data.value);
            break;
        }
        case ('update'): {
            updateTodo(data.value);
            break;
        }
    }

};

function add(data) {
    let todo = { id: Date.now(), value: data.value, isDone: false };
    let request = db.transaction("todos", "readwrite").objectStore("todos").add(todo);

    request.onsuccess = function (event) {
        self.postMessage({ type: 'add', msg: 'todo added', todo: todo });
    }

    request.onerror = errorHandler
};

function readAll() {
    let request = db.transaction("todos").objectStore("todos");
    let todos = [];
    request.openCursor().onsuccess = function (event) {
        let cursor = event.target.result;


        if (cursor) {
            todos.push(cursor.value);
            cursor.continue();
        }
        else {
            self.postMessage({ type: 'readAll', todos: todos, msg: 'all todos posted' });
        }
    }
};

function deleteTodo(data) {
    let request = db.transaction("todos", "readwrite").objectStore("todos").delete(data);

    request.onsuccess = function (event) {
        self.postMessage({ type: 'delete', msg: "todo deletes", todo: data });
    }

    request.onerror = errorHandler
}

function updateTodo(id) {
    let todo;
    let objectStore = db.transaction("todos", "readwrite").objectStore("todos");
    let getRequest = objectStore.get(id);

    getRequest.onsuccess = function (event) {
        todo = event.target.result;
        todo.isDone = !todo.isDone;

        let putRequest = objectStore.put(todo);

        putRequest.onsuccess = function (event) {
            self.postMessage({ type: 'update', msg: "todo updated", todo: todo });
        }

        putRequest.onerror = errorHandler;
    }


    getRequest.onerror = errorHandler;

}

function errorHandler(event) {
    self.postMessage({ type: 'error', msg: 'error: ' + event.target.error });
}