const GlobalLoader = () => {
    return (
        <>
            {/* <!-- loader starts--> */}
            <div className="loader-wrapper">
                <div className="loader">
                    <div className="loader4"></div>
                </div>
            </div>
            {/* <!-- loader ends--> */}

            {/* <!-- tap on top starts--> */}
            <div className="tap-top">
                <i data-feather="chevrons-up"></i>
            </div>
            {/* <!-- tap on tap ends--> */}
        </>
    );
};

export default GlobalLoader;
