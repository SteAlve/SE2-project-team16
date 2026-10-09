import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import ServiceCard from "../cards/ServiceCard/ServiceCard";

function ServiceGrid({ services, onSelect }) {
  return (
      <Row>
        {services.map((service) => (
          <Col key={service.id} xs={12} sm={6} className="d-flex justify-content-center align-items-center">
            <ServiceCard
              name={service.name}
              onClick={() => onSelect(service)}
            />
          </Col>
        ))}
      </Row>
  );
}

export default ServiceGrid;
