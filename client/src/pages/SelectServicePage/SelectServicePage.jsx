import { Container } from "react-bootstrap";
import EstimatedTimeDisclaimerFooter from "../../components/footers/estimated-time-disclaimer-footer/EstimatedTimeDisclaimerFooter";
import ServiceGrid from "../../components/grids/ServiceGrid";
import './select-service-page.css'


function SelectServicePage() {

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
                    <ServiceGrid/>
                </div>

                <EstimatedTimeDisclaimerFooter />
            </div>
        </>
    );
}

export default SelectServicePage;