export default function Footer() {
    return (
        <footer className="footer">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12 footer-copyright text-center">
                        <p className="mb-0">
                            Copyright {new Date().getFullYear()} ©{' '}
                            {import.meta.env.VITE_APP_NAME ?? 'Laravel'}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
