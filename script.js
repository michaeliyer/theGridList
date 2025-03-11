document.addEventListener("DOMContentLoaded", function () {
    let sections = JSON.parse(localStorage.getItem("sections")) || {
        "Section 1": [],
        "Section 2": [],
        "Section 3": []
    };

    const container = document.getElementById("sectionsContainer");

    function renderSections() {
        container.innerHTML = "";
        Object.keys(sections).forEach(sectionName => {
            const section = document.createElement("div");
            section.className = "section";
            
            // Section Title (Editable)
            const title = document.createElement("span");
            title.className = "section-title";
            title.textContent = sectionName;
            title.addEventListener("click", () => editSectionName(sectionName));

            // Delete Section Button
            const deleteSectionBtn = document.createElement("button");
            deleteSectionBtn.className = "delete-section-btn";
            deleteSectionBtn.textContent = "🗑 Delete Section";
            deleteSectionBtn.addEventListener("click", () => deleteSection(sectionName));

            // Task List
            const list = document.createElement("ul");
            list.id = sectionName.replace(/\s+/g, "") + "List"; // Unique ID for list

            // Task Input and Add Button
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Add a task...";
            input.id = sectionName.replace(/\s+/g, "") + "Task";

            const addBtn = document.createElement("button");
            addBtn.textContent = "➕ Add";
            addBtn.addEventListener("click", () => addTask(sectionName));

            section.appendChild(title);
            section.appendChild(deleteSectionBtn);
            section.appendChild(list);
            section.appendChild(input);
            section.appendChild(addBtn);
            
            container.appendChild(section);
            renderTasks(sectionName);
        });
        saveSections();
    }

    function renderTasks(sectionName) {
        const list = document.getElementById(sectionName.replace(/\s+/g, "") + "List");
        list.innerHTML = "";
        sections[sectionName].forEach((task, index) => {
            const li = document.createElement("li");
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.checked;
            checkbox.dataset.index = index;
            checkbox.dataset.section = sectionName;
            checkbox.addEventListener("change", updateTaskStatus);

            const deleteButton = document.createElement("button");
            deleteButton.innerText = "✖";
            deleteButton.className = "delete-btn";
            deleteButton.dataset.index = index;
            deleteButton.dataset.section = sectionName;
            deleteButton.addEventListener("click", deleteTask);

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" " + task.text));
            li.appendChild(label);
            li.appendChild(deleteButton);
            list.appendChild(li);
        });
        saveSections();
    }

    function updateTaskStatus(event) {
        const index = event.target.dataset.index;
        const section = event.target.dataset.section;
        sections[section][index].checked = event.target.checked;
        saveSections();
    }






    window.addTask = function (sectionName) {
        const inputId = sectionName.replace(/\s+/g, "") + "Task";
        const inputElement = document.getElementById(inputId);
        let text = inputElement.value.trim();
    
        if (text) {
            // Remove leading "- [x] " or any checkbox-like format
            text = text.replace(/^-\s*\[.\]\s*/, "");
    
            sections[sectionName].push({ text, checked: false });
            inputElement.value = "";
            renderTasks(sectionName);
        }
    };

  
    function deleteTask(event) {
        const index = event.target.dataset.index;
        const section = event.target.dataset.section;

        if (confirm("🚨 Are you SURE you want to delete this task?")) {
            if (confirm("⚠️ REALLY sure? There's no undo!")) {
                if (confirm("🔥 FINAL WARNING: This task will be gone forever!")) {
                    sections[section].splice(index, 1);
                    renderTasks(section);
                }
            }
        }
    }

    function deleteSection(sectionName) {
        if (confirm(`❌ Delete the entire "${sectionName}" section?`)) {
            delete sections[sectionName];
            renderSections();
        }
    }

    function editSectionName(oldName) {
        const newName = prompt("Enter a new name for this section:", oldName);
        if (newName && newName.trim() !== "" && newName !== oldName) {
            sections[newName] = sections[oldName]; // Copy tasks
            delete sections[oldName]; // Remove old section
            renderSections();
        }
    }

    window.addSection = function () {
        const input = document.getElementById("newSection");
        const sectionName = input.value.trim();
        if (sectionName && !sections[sectionName]) {
            sections[sectionName] = [];
            input.value = "";
            renderSections();
        }
    };

    function saveSections() {
        localStorage.setItem("sections", JSON.stringify(sections));
    }

    renderSections();
});






function exportData() {
    const dataStr = JSON.stringify(localStorage.getItem("sections"));
    const blob = new Blob([dataStr], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "checklist_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData) {
                localStorage.setItem("sections", importedData);
                alert("✅ Data imported successfully!");
                location.reload(); // Reload to reflect changes
            }
        } catch (error) {
            alert("❌ Invalid file format!");
        }
    };
    reader.readAsText(file);
}