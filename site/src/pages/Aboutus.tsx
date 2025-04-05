import Cross from '../assets/icon/Cross_Icon.png';
import Full from '../assets/icon/FullScreen_Icon.png';
import Reduce from '../assets/icon/Reduce_Icon.png';

import "../stylesheets/Aboutus.css";
const teamMembers = [
    {
        name: "Randy Bou-Jaber",
        role: "Project Manager",
        description: "Pretty af",
        image: "https://via.placeholder.com/150",
        linkedin: "https://www.linkedin.com/in/alice-dupont",
        email: "mailto:alice@example.com"
    },
    {
        name: "Martial Carceles",
        role: "Developper python",
        description: "Young developper always willing to learn more about IT. Hire him because he's the best in the world (Written by himself)",
        image: "https://via.placeholder.com/150",
        linkedin: "https://www.linkedin.com/in/lucas-morel",
        email: "mailto:lucas@example.com"
    },
    {
        name: "Jules Renaud-Granges",
        role: "Developper FullStack",
        description: "Better than Martial",
        image: "https://via.placeholder.com/150",
        linkedin: "https://www.linkedin.com/in/jean-martin",
        email: "mailto:jean@example.com"
    },
    {
        name: "Guillaume Augeraud",
        role: "Developper Front-end",
        description: "Im the only serious one here",
        linkedin: "https://www.linkedin.com/in/sophie-bernard",
        email: "mailto:sophie@example.com"
    }
];

const About = () => {
    return (
        <>
        <h1 className="about-title">About us</h1>
        <div className="aboutus-container">
            {teamMembers.map((member, index) => (
                <div 
                    key={index} 
                    className={`about-container `}
                >
                    <div className="about-top">
                        <div className="icons-container">
                            <img className='icon' src={Reduce}></img>
                            <img className='icon' src={Full}></img>
                            <img className='icon' src={Cross}></img>
                        </div>
                    </div>
                    <div className='about-content'>
                        <img src={member.image} alt={member.name} className="member-image" />
                        <div className="member-info">
                            <h2 className="member-name">{member.name}</h2>
                            <h3 className="member-role">{member.role}</h3>
                            <p className="member-description">{member.description}</p>
                            <div className="member-links">
                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                                <a href={member.email}>Email</a>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        </>
    );
}

export default About