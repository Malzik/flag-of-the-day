import React from 'react';
import FlagComponent from "./component/flag/flag";
import Header from "./component/header/header";

function App() {
  return (
    <div className={'bg-white dark:bg-slate-800 h-screen'}>
        <Header></Header>
        <FlagComponent></FlagComponent>
    </div>
  );
}

export default App;
