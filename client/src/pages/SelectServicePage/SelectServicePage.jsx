import { Button, Container, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import EstimatedTimeDisclaimerFooter from "../../components/footers/estimated-time-disclaimer-footer/EstimatedTimeDisclaimerFooter";
import ServiceGrid from "../../components/grids/ServiceGrid";
import { useServices } from "../../hooks/useServices";
import './select-service-page.css'


function SelectServicePage() {

    const navigate = useNavigate();
    const { services, loading, error, reload } = useServices();

    const selectService = (service) =>
        navigate('/show-ticket', { state: { serviceId: service.id } });

    const renderServices = () => {
        if (loading) {
            return (
                <div className="service-status">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            );
        }

        if (error) {
            const message = error.status === 0
                ? "Unable to reach the server."
                : "Services are temporarily unavailable.\nPlease try again later.";
            return (
                <div className="service-status">
                    <p style={{ whiteSpace: "pre-line" }}>{message}</p>
                    <Button className="try-again-button" onClick={reload}>
                        Try again
                    </Button>
                </div>
            );
        }

        if (services.length === 0) {
            return (
                <div className="service-status">
                    <p>No services are available at the moment.</p>
                </div>
            );
        }

        return <ServiceGrid services={services} onSelect={selectService} />;
    };

    return (
        <>
            <div
                className="counter-screen"
            >
                <Container className="service-title-container">
                    <h1 className="service-title">
                        What service do you need?
                    </h1>
                </Container>
                <Container className="service-description-container">
                    <h2 className="service-description">
                        Select a service to get your ticket
                    </h2>
                </Container>

                <div className="service-grid-container">
                    {renderServices()}
                </div>

                <EstimatedTimeDisclaimerFooter />
            </div>
        </>
    );
}

export default SelectServicePage;
