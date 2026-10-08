import Card from "react-bootstrap/Card";
import { useNavigate } from 'react-router-dom';
import "./service-card.css";

function ServiceCard({ name, image }) {
  const navigate = useNavigate();
  return (
    <Card className="service-card" onClick={() => { navigate('/show-ticket') }}>
      <Card.Body>
        <div className="service-image">
          {image ? (
            <img src={image} alt={name} />
          ) : (
            <span>Service Image</span>
          )}
        </div>
        <Card.Title className="service-name">
          {name}
        </Card.Title>

      </Card.Body>
    </Card>
  );
}

export default ServiceCard;


/*
import { FaRegClock } from "react-icons/fa6";
      <div className="service-duration">
          <FaRegClock size={22} />
          <span>{duration}</span>
        </div>*/