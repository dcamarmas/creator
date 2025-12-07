# Privileged instructions in CREATOR
A privileged instruction is an instruction that can only be executed in a privileged execution mode. In CREATOR, we define two execution modes: _user_ (non-privileged) and _kernel_ (privileged).

An instruction is defined as privileged if it has the `privileged` property.

The current execution mode is tracked by the `currentExecutionMode` variable, which is part of the _enum_ `ExecutionMode`, which can hold two values: `ExecutionMode.User` and `ExecutionMode.Kernel`.  
This variable is initialized to `ExecutionMode.User`.