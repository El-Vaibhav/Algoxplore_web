// Import React to use its hooks
import * as React from "react";

// Import types for toast components from the UI library
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

// Limit the number of toasts shown at once
const TOAST_LIMIT = 1;
// Delay before removing a dismissed toast (in milliseconds)
const TOAST_REMOVE_DELAY = 1000000;

// Define the structure of a toast object with an ID and optional properties
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// Define action types for the toast state management
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

// Counter for generating unique IDs
let count = 0;

// Function to generate a unique ID for each toast
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Type alias for action types
type ActionType = typeof actionTypes;

// Define the possible actions for the toast reducer
type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

// Define the state structure for the toast system
interface State {
  toasts: ToasterToast[];
}

// Map to store timeouts for removing toasts
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// Function to add a toast to the removal queue after a delay
const addToRemoveQueue = (toastId: string) => {
  // If already in queue, don't add again
  if (toastTimeouts.has(toastId)) {
    return;
  }

  // Set a timeout to remove the toast after the delay
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  // Store the timeout
  toastTimeouts.set(toastId, timeout);
};

// Reducer function to handle state changes based on actions
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Add new toast to the beginning, limit to TOAST_LIMIT
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      // Update the toast with matching ID
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // Side effects: add toasts to removal queue
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        // If no specific ID, dismiss all toasts
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      // Mark toasts as not open (dismissed)
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case "REMOVE_TOAST":
      // Remove toast(s) from state
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

// Array of listener functions to notify when state changes
const listeners: Array<(state: State) => void> = [];

// Initial state in memory
let memoryState: State = { toasts: [] };

// Function to dispatch actions and update state
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  // Notify all listeners of the new state
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// Type for toast properties without ID
type Toast = Omit<ToasterToast, "id">;

// Main toast function to create and show a toast
function toast({ ...props }: Toast) {
  // Generate unique ID
  const id = genId();

  // Function to update the toast
  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });

  // Function to dismiss the toast
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  // Dispatch action to add the toast
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss(); // Dismiss when closed
      },
    },
  });

  // Return control functions
  return {
    id: id,
    dismiss,
    update,
  };
}

// Custom hook to use the toast system in components
function useToast() {
  // Local state that syncs with global memory state
  const [state, setState] = React.useState<State>(memoryState);

  // Effect to add/remove this component as a listener
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  // Return the current state and control functions
  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

// Export the hook and toast function
export { useToast, toast };
