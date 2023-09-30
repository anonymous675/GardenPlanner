import { Outlet, Link } from "react-router-dom";

const Layout = () => {
    return (
        <Outlet />
        // <>
        //     <nav>
        //         <ul>
        //             <li>
        //                 <Link to="/">Home</Link>
        //             </li>
        //             <li>
        //                 <Link to="/planner">Planner</Link>
        //             </li>
        //         </ul>
        //     </nav>

        //     <Outlet />
        // </>
    );
};

export default Layout;
