# Hamiltonian Cycle Explorer

An interactive educational web application developed to demonstrate the **Hamiltonian Cycle problem** in graph theory using the Backtracking Algorithm. This project helps students understand the concept of Hamiltonian cycles, explore graph structures, and learn how backtracking can be used to search for a valid cycle.

## ✨ Features

- **Concept Overview:** Learn the definition and fundamental concept of a Hamiltonian Cycle.
- **Algorithm Explanation:** Understand the backtracking approach used to find a Hamiltonian Cycle.
- **Interactive Demonstration:** Explore the Hamiltonian Cycle problem through the website's graph-based demonstration.
- **Example Graphs:** Examine examples to understand when a Hamiltonian Cycle exists and when it does not.
- **Visual Learning Interface:** A user-friendly interface designed to make graph theory concepts easier to understand.
- **Responsive Design:** Designed to provide a clear browsing experience across different screen sizes.

## 🧠 What Is a Hamiltonian Cycle?

A Hamiltonian Cycle is a cycle in a graph that visits every vertex exactly once and returns to the starting vertex.

A graph may contain a Hamiltonian Cycle, or it may not. Determining whether such a cycle exists is a well-known problem in graph theory and computer science.

## ⚙️ Algorithm Used

**Backtracking Algorithm**

Backtracking explores possible vertex sequences while checking whether each next vertex can be added to the current path. If a path cannot produce a valid Hamiltonian Cycle, the algorithm goes back and explores another possibility.

**Worst-case time complexity:** \(O(n!)\) for a straightforward backtracking implementation.

**Auxiliary space complexity:** \(O(n)\) for the path and recursion stack, excluding graph storage.

## 🛠️ Technologies Used

- HTML5 — webpage structure
- CSS3 — layout and styling
- JavaScript — algorithm logic and interactivity

## 🚀 How to Run Locally

1. Clone or download this repository.
2. Keep `index.html`, `style.css`, and `script.js` in the same project folder.
3. Open `index.html` in a web browser, or run it using the Live Server extension in Visual Studio Code.

No additional installation is required for this vanilla HTML, CSS, and JavaScript project.

