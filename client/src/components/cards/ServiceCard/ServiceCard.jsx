import Card from "react-bootstrap/Card";
import "./service-card.css";

function ServiceCard({ name, image, onClick }) {
  return (
    <Card
      className="service-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
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
