import { Row, Col } from 'react-bootstrap';
import { IoMdInformationCircleOutline } from "react-icons/io";
import './EstimatedTimeDisclaimerFooter.css'


export default function EstimatedTimeDisclaimerFooter() {
    return (
        <Row className="estimated-time-disclaimer-footer-container justify-content-center align-items-center">
            <Col xs="auto" className='estimated-time-disclaimer-footer-icon'>
                <IoMdInformationCircleOutline size={48}/>
            </Col>

            <Col xs="auto">
                <p className="mb-0 estimated-time-disclaimer-footer-label">
                    Estimated waiting times are indicative and may vary.
                </p>
            </Col>
        </Row>
    );
}