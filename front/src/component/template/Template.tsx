import React from "react";
import Header from "../header/header";
import {Outlet} from "react-router-dom";

export function Template() {
    return (
        <div className={'bg-white dark:bg-black h-screen'}>
            <Header></Header>
            <Outlet/>
        </div>
    )
}
