import { useEffect } from "react";
import { Button, Container, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from 'react-router-dom';
import { useIssueTicket } from "../../hooks/useIssueTicket";
import './show-ticket-page.css';

// Turns an issue error into the text for the customer, and tells if trying again can help.
function describeError(error) {
    if (error.status === 0)
        return { message: "Unable to reach the server.", canRetry: true };
    if (error.status === 409 && error.error === 'DailyLimitReachedError')
        return { message: "No more tickets available today for this service.", canRetry: false };
    if (error.status === 409)
        return { message: "Something went wrong. Please try again.", canRetry: true };
    if (error.status === 422)
        return { message: "This service is no longer available.", canRetry: false };
    if (error.status === 400)
        return { message: "Invalid request. Please select the service again.", canRetry: false };
    return { message: "Unable to issue the ticket right now. Please try again later.", canRetry: true };
}

function ShowTicketPage() {

    const navigate = useNavigate();
    const location = useLocation();

    // After the ticket is issued its code replaces serviceId in the history state,
    // so reloading the page shows the same ticket instead of issuing a new one.
    const savedCode = location.state?.code;
    const serviceId = savedCode ? null : location.state?.serviceId;

    const { ticket, loading, error, retry } = useIssueTicket(serviceId);

    useEffect(() => {
        if (ticket) navigate('.', { replace: true, state: { code: ticket.code } });
    }, [ticket, navigate]);

    const code = savedCode ?? ticket?.code;

    const renderContent = () => {
        if (code) {
            return (
                <>
                    <Container className="ticket-title-container">
                        <h1 className="ticket-title">
                            Your ticket
                        </h1>
                    </Container>
                    <Container className="ticket-number-container">
                        <h1 className="ticket-number">
                            {code}
                        </h1>
                    </Container>
                </>
            );
        }

        if (loading) {
            return (
                <div className="ticket-status">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            );
        }

        if (error) {
            const { message, canRetry } = describeError(error);
            return (
                <div className="ticket-status">
                    <p>{message}</p>
                    {canRetry && (
                        <Button className="try-again-button" onClick={retry}>
                            Try again
                        </Button>
                    )}
                </div>
            );
        }

        // Page opened without choosing a service first.
        return (
            <div className="ticket-status">
                <p>No service selected.</p>
            </div>
        );
    };

    return (
        <>
            <div
                className="counter-screen"
            >
                {renderContent()}

                <Button className="show-ticket-button" onClick={()=>{navigate('/select-service')}}>
                    Ok
                </Button>
                {/* TODO (waiting time story): import EstimatedTimeDisclaimerFooter from
                    "../../components/footers/estimated-time-disclaimer-footer/EstimatedTimeDisclaimerFooter"
                    and render <EstimatedTimeDisclaimerFooter /> here. */}
            </div>
        </>
    );
}

export default ShowTicketPage;
