import React from "react";
import Header from "../header/header";
import {Outlet} from "react-router-dom";

export function Template() {
    return (
        <div className={'bg-white dark:bg-black h-screen flex flex-col'}>
            <Header></Header>
            <div className="flex-grow">
                <Outlet/>
            </div>
            <nav>
                <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer">Terms of Service</a>
            </nav>
        </div>
    )
}
