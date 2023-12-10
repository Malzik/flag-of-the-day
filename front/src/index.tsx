import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import {Provider} from "react-redux";
import store from "./store/store";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {Template} from "./component/template/Template";
import FlagComponent from "./component/flag/flag";
import HomeComponent, {loader} from "./component/home/home";
import WinComponent from "./component/win/win";
import LooseComponent from "./component/loose/loose";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const router = createBrowserRouter([
    {
        element: <Template />,
        children: [
            {
                path: "",
                element: <HomeComponent/>,
            },
            {
                path: "/game",
                element: <FlagComponent/>,
                loader: loader
            },
            {
                path: "/win",
                element: <WinComponent/>,
                loader: loader
            },
            {
                path: "/loose",
                element: <LooseComponent/>,
                loader: loader
            }
        ]
    }
]);
root.render(
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
