//########################################################
//# Test Worker
//########################################################
//# The test worker is a simple script that allows easy
//# management of test tasks.  It stores tests in an array
//# and runs each test one after the other.  These tests 
//# are async, so the test manager will wait for a test
//# to complete and print the result to the console.

// Test list
let test_tasks = [];

// Wait Function
const waitDelay = ms => new Promise(res => setTimeout(res, ms));

// Run All tasks in list
async function RunTestTasks() {
    for (let i = 0; i < test_tasks.length; ++i) {
        let task = test_tasks[i];
        let taskNameHandle = "🛠️ Running " + task.GetName();
        console.log(taskNameHandle);
        EngineBanner(taskNameHandle);

        console.log(task.GetDesc());
        let success = await task.RunProcess();
        if (success != 0) {
            console.log("❌ " + task.GetName() + " finished with errors");
            console.log(success);
        } else {
            console.log("✅ " + task.GetName() + " finished successfully");
        }
    }
    EngineBanner("");
}

// Add a task to the list
function CreateTest(name, description, process) {
    test_tasks.push(new TestTask(name, description, process));
}

// Test Task Class
class TestTask {
    constructor(name, description, process) {
        this.name = name;
        this.description = description;
        this.process = process;
    }

    GetName() { return this.name; }
    GetDesc() { return this.description; }
    RunProcess() {
        return this.process();
    }
}