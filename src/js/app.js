// Manejo de eventos principal (Delegación de eventos)
document.addEventListener("DOMContentLoaded", () => {
    const newTodo = document.querySelector(".new-todo");
    const todoList = document.querySelector(".todo-list");

    if (newTodo) {
        newTodo.focus();
        newTodo.addEventListener("keydown", event => {
            if (event.key === "Enter") newTask();
        });
    }

    // Cargar tareas almacenadas y aplicar filtro
    loadTasksFromLocalStorage();
    filterTasks();
    hideElement();
    updateClearCompletedVisibility();
    updateTaskCount();

    // Delegación de eventos en la lista de tareas
    todoList.addEventListener("click", event => {
        const taskItem = event.target.closest("li");

        if (!taskItem) return;

        if (event.target.matches("input.toggle")) {
            taskItem.classList.toggle("completed");
            saveTasksToLocalStorage();
            filterTasks();
            updateClearCompletedVisibility();
        }

        if (event.target.matches(".destroy")) {
            if (confirm("¿Seguro que quieres eliminar esta tarea?")) {
                taskItem.remove();
                saveTasksToLocalStorage();
                filterTasks();
                updateClearCompletedVisibility();
            }
        }
    });

    // Doble clic para editar tarea
    todoList.addEventListener("dblclick", event => {
        if (!event.target.matches("label")) return;

        const taskItem = event.target.closest("li");
        taskItem.classList.add("editing");

        const inputEdit = taskItem.querySelector(".edit");
        inputEdit.style.display = "block";
        inputEdit.focus();
        inputEdit.select();

        const handleSave = () => saveTask(taskItem);
        const handleCancel = () => cancelEdit(taskItem);

        inputEdit.addEventListener("keydown", event => {
            if (event.key === "Enter") handleSave();
            if (event.key === "Escape") handleCancel();
        });

        inputEdit.addEventListener("blur", () => setTimeout(handleCancel, 100));
    });

    // Limpiar tareas completadas
    document.querySelector(".clear-completed").addEventListener("click", () => {
        document.querySelectorAll(".todo-list .completed").forEach(task => task.remove());
        saveTasksToLocalStorage();
        filterTasks();
        updateClearCompletedVisibility();
    });
});

// Oculta los elementos si están vacíos
const hideElement = (() => {
    const elements = () => document.querySelectorAll(".main, .footer");

    const updateVisibility = () => {
        elements().forEach(e => {
            e.style.display = e.textContent.trim() ? "block" : "none";
        });
    };

    const observer = new MutationObserver(updateVisibility);

    elements().forEach(e => observer.observe(e, { childList: true, subtree: true, characterData: true }));

    // Aplicar el ajuste desde el inicio
    updateVisibility();

    return () => {
        updateVisibility(); // Forzar revisión manualmente
    };
})();

// Agregar nueva tarea
const createTaskElement = (taskText, isCompleted) => {
    const li = document.createElement("li");

    if (isCompleted === true) {
        li.classList.add("completed");
    }

    li.innerHTML = `
        <div class="view">
            <input class="toggle" type="checkbox" ${isCompleted ? "checked" : ""}>
            <label>${taskText}</label>
            <button class="destroy"></button>
        </div>
        <input class="edit" value="${taskText}" style="display: none;">
    `;

    return li;
};

export const newTask = () => {
    const newTodo = document.querySelector(".new-todo");
    const taskText = newTodo.value.trim();
    if (!taskText) return;

    document.querySelector(".todo-list").appendChild(createTaskElement(taskText));
    saveTasksToLocalStorage();
    newTodo.value = "";
    filterTasks();
};

// Filtrar tareas según el hash
const filterTasks = () => {
    const tasks = [...document.querySelectorAll(".todo-list li")];
    const hash = window.location.hash || "/#";

    tasks.forEach(task => {
        const isCompleted = task.classList.contains("completed");
        task.style.display =
            (hash === "#/pending" && isCompleted) ||
            (hash === "#/completed" && !isCompleted)
                ? "none"
                : "block";
    });

    // Subrayar el enlace seleccionado
    const links = document.querySelectorAll("a");
    links.forEach(link => {
        link.style.textDecoration = "none"
        link.classList.remove("selected");
    });

    const activeLink = document.querySelector(`a[href="${hash}"]`);
    if (activeLink) { 
        activeLink.style.textDecoration = "underline";
        activeLink.classList.add("selected");
    }

    window.addEventListener("hashchange", filterTasks);
};

// Guardar tareas en localStorage
const saveTasksToLocalStorage = () => {
    const tasks = [...document.querySelectorAll(".todo-list li")].map(task => ({
        text: task.querySelector("label").textContent,
        completed: task.classList.contains("completed")
    }));
    localStorage.setItem("mydayapp-js", JSON.stringify(tasks));
    updateTaskCount();
};

// Cargar tareas desde localStorage
const loadTasksFromLocalStorage = () => {
    const tasks = JSON.parse(localStorage.getItem("mydayapp-js") || "[]");
    const todoList = document.querySelector(".todo-list");

    tasks.forEach(({ text, completed }) => todoList.appendChild(createTaskElement(text, completed)));
};

// Contador de tareas pendientes
const updateTaskCount = () => {
    const todoCount = document.querySelector(".todo-count");
    const count = document.querySelectorAll(".todo-list li:not(.completed)").length;

    todoCount.innerHTML = `<strong>${count}</strong> ${count === 1 ? "item left" : "items left"}`;
};

// Guardar cambios en una tarea
const saveTask = taskItem => {
    const inputEdit = taskItem.querySelector(".edit");
    const label = taskItem.querySelector("label");

    const textTask = inputEdit.value.trim();
    if (textTask) {
        label.textContent = textTask;
    } else {
        taskItem.remove();
    }
    
    exitEditMode(taskItem);
    saveTasksToLocalStorage();
};

// Cancelar edición
const cancelEdit = taskItem => {
    taskItem.querySelector(".edit").value = taskItem.querySelector("label").textContent;
    exitEditMode(taskItem);
};

// Salir del modo edición
const exitEditMode = taskItem => {
    taskItem.classList.remove("editing");
    taskItem.querySelector(".edit").style.display = "none";
};

// Limpia tareas completadas
export const clearCompleted = () => {
    document.querySelector(".clear-completed").addEventListener("click", () => {
        document.querySelectorAll(".todo-list .completed").forEach(task => task.remove());
        saveTasksToLocalStorage();
        filterTasks();
        updateClearCompletedVisibility();
    });
};

// Actualizar visibilidad del botón "Limpiar Completadas"
const updateClearCompletedVisibility = () => {
    const clearCompletedBtn = document.querySelector(".clear-completed");
    const hasCompletedTasks = document.querySelectorAll(".todo-list .completed").length > 0;
    clearCompletedBtn.style.display = hasCompletedTasks ? "block" : "none";
};
