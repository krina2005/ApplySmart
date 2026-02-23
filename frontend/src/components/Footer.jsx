import React, { useEffect, useState } from 'react';
import './Footer.css';

const Footer = () => {
    const [footerData, setFooterData] = useState({
        copyright: '',
        tagline: ''
    });

    useEffect(() => {
        fetch('/footer.xml')
            .then((response) => response.text())
            .then((data) => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(data, "application/xml");

                const copyright = xml.getElementsByTagName("copyright")[0].textContent;
                const tagline = xml.getElementsByTagName("tagline")[0].textContent;

                setFooterData({
                    copyright,
                    tagline
                });
            });
    }, []);

    return (
        <footer className="app-footer">
            <div className="footer-content">
                <p>{footerData.copyright}</p>
                <p className="footer-tagline">{footerData.tagline}</p>
            </div>
        </footer>
    );
};

export default Footer;
