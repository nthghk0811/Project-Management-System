
import { AuthProvider } from './context/AuthContext.jsx'
import * as ReactDOM from "react-dom/client";
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
