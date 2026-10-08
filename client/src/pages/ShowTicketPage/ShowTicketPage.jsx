import { Button, Container } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import EstimatedTimeDisclaimerFooter from "../../components/footers/estimated-time-disclaimer-footer/EstimatedTimeDisclaimerFooter";
import './show-ticket-page.css';

function ShowTicketPage() {

    const navigate = useNavigate();

    return (
        <>
            <div
                className="counter-screen"
            >
                <Container className="ticket-title-container">
                    <h1 className="ticket-title">
                        Your ticket
                    </h1>
                </Container>
                <Container className="ticket-number-container">
                    <h1 className="ticket-number">
                        A 047
                    </h1>
                </Container>

                <Button className="show-ticket-button" onClick={()=>{navigate('/select-service')}}>
                    Ok
                </Button>
                <EstimatedTimeDisclaimerFooter/>
            </div>
        </>
    );
}

export default ShowTicketPage;