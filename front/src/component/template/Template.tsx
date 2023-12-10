import React from "react";
import Header from "../header/header";
import {Outlet} from "react-router-dom";

export function Template() {
    return (
        <div className={'bg-slate-100 dark:bg-slate-800 h-screen'}>
            <Header></Header>
            <Outlet/>
        </div>
    )
}
