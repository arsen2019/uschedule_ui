import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../../rootRoute";
import React, { useEffect } from "react";
import { Button, Card, Tag, Typography, Divider, Space } from "antd";
import { Footer } from "../../../../core/components/Footer/Footer";
import {
    PhoneOutlined,
    MailOutlined,
    LinkedinOutlined,
    GithubOutlined,
    GlobalOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    LinkOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export const resumeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/resume',
    component: Resume
});

const containerStyle = {
    display: "flex",
    height: '100%',
    width: 'calc(100% - 20px)',
    maxWidth: '800px',
    padding: '0 10px',
    marginBottom: '20px'
};

interface WorkExperience {
    title: string;
    company: string;
    period: string;
    description: string[];
    links?: {
        label: string;
        url: string;
        icon?: React.ReactNode;
    }[];
}

interface Education {
    institution: string;
    degree: string;
    status: string;
}

interface ContactInfo {
    phone: string;
    email: string;
    linkedin: string;
    github: string;
    portfolio: string;
    location: string;
}

const resumeData = {
    name: "ARSEN GRIGORYAN",
    title: "Software Engineer",
    summary: "As a current IT student of NPUA with a primary knowledge of IT implementations, my background has prepared me to excel in an internship capacity, enabling me to amass hands‐on practicum and experience in IT systems. After two years of service in the Armenian Armed Forces, and having some practical background in Python various tools and libraries for now, I'm very enthusiastic to obtain hands‐on practice in practical work with a team. I'm eagerly anticipating new chances to exhibit my professional skills and knowledge.",

    contact: {
        phone: "043396663",
        email: "arsen.grigoryan555@gmail.com",
        linkedin: "https://www.linkedin.com/in/arsen-grigoryan-18947b183/",
        github: "https://github.com/arsen2019",
        portfolio: "https://schedule.arsgreg.com/",
        location: "Yerevan, Armenia"
    } as ContactInfo,

    workExperience: [
        {
            title: "PROGRAMMING INSTRUCTOR",
            company: "THINK ENGINEERING",
            period: "06.2025 - present",
            description: [
                "Teaching programming fundamentals to children using Scratch (MIT), introducing them to problem-solving concepts",
                "Demonstrated exceptional teamwork by collaborating closely with fellow instructors to create cohesive learning experiences",
                "Showcased strong communication skills and patience while adapting teaching methods to different learning styles and age groups",
            ],
            links: [
                {
                    label: "Think Engineering",
                    url: "https://www.ithink.am/",
                    icon: <GlobalOutlined />
                }
            ]
        },
        {
            title: "PYTHON BACKEND DEVELOPER",
            company: "UNIVERSITY",
            period: "05.2024 - present",
            description: [
                "Created an online schedule for my faculty that is mobile‐friendly and allows to track courses every week",
                "Created back‐end using FastAPI, pydentic, uvicorn, SQLAlchemy",
                "Developed the front‐end using React, Ant‐Design and openAPI specification",
                "Containerized it using Docker and developed it to a remote server"
            ],
            links: [
                {
                    label: "Live Project",
                    url: "https://schedule.arsgreg.com/",
                    icon: <GlobalOutlined />
                },
                {
                    label: "Source Code Frontend",
                    url: "https://github.com/arsen2019/uschedule_ui",
                    icon: <GithubOutlined/>
                },
            ]
        },
        {
            title: "WEB DEVELOPER",
            company: "LEADIN BRANDING AGENCY",
            period: "01.2025 - 04.2025",
            description: [
                "Created Frontend service using Astro with React (TypeScript) implementation",
                "Containerized the services with Docker and deployed them on the remote server",
                "Added a headless CMS for content writing, for the blog with markdown for better SEO purposes",
                "Applied styling with Tailwind CSS"
            ],
            links: [
                {
                    label: "Agency Website",
                    url: "https://leadin.agency/",
                    icon: <GlobalOutlined />
                }
            ]
        },

        {
            title: "ML MODELS AND DATA PROCESSING",
            company: "INSTIGATE (University Partner)",
            period: "05.2023 - 09.2023",
            description: [
                "Implemented face and object recognition using the YOLO model. Learned about image processing techniques and how to enhance model output",
                "Applied Tesseract OCR to extract text from images",
                "For my concluding project, I trained a custom speech recognition model with Kaldi, successfully recognizing five Armenian words from an audio input"
            ],
            links: [
                {
                    label: "Company Website",
                    url: "https://instigate.am/",
                    icon: <GlobalOutlined />
                }
            ]
        }
    ] as WorkExperience[],

    education: {
        institution: "NATIONAL POLYTECH UNIVERSITY OF ARMENIA",
        degree: "APPLIED MATHEMATICS AND INFORMATICS - BACHELOR'S",
        status: "present"
    } as Education,

    skills: [
        "Self Discipline",
        "Time Management",
        "Punctual",
        "Initiative",
        "Detail Oriented"
    ],

    languages: [
        { name: "Armenian", level: "Native" },
        { name: "English", level: "Full proficiency" },
        { name: "Russian", level: "Full proficiency" }
    ],

    technologies: [
        "Python", "FastAPI","pydentic", "PostgreSQL", "React", "TypeScript", "Docker","GIT", "CI/CD",
        "SQLAlchemy", "Ant Design", "Tailwind CSS", "Astro",
        "YOLO", "Kaldi", "Tesseract OCR"
    ]
};

function Resume() {
    useEffect(() => {
        document.title = `${resumeData.name} | Resume`;
    }, []);

    const formatLink = (url: string, text?: string) => {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1890ff', textDecoration: 'none' }}
            >
                {text || url}
            </a>
        );
    };

    return (
        <div className="container" style={{...containerStyle, flexDirection: "column"}}>
            {/* Header */}
            <div className="nav" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px 0',
                marginBottom: '20px'
            }}>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                    Resume
                </Title>
            </div>

            <div style={{
                overflow: 'auto',
                flexGrow: 1,
                minHeight: 0,
            }}>
                {/* Personal Info Header */}
                <Card style={{
                    marginBottom: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <Title level={1} style={{ color: 'white', margin: '0 0 8px 0' }}>
                            {resumeData.name}
                        </Title>
                        <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 16px 0' }}>
                            {resumeData.title}
                        </Title>
                        <Space style={{ color: 'white' }}>
                            <EnvironmentOutlined />
                            <Text style={{ color: 'white' }}>{resumeData.contact.location}</Text>
                        </Space>
                    </div>
                </Card>

                {/* Contact Information */}
                <Card title="Contact" style={{ marginBottom: '20px' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                            <PhoneOutlined />
                            <Text>{resumeData.contact.phone}</Text>
                        </Space>
                        <Space>
                            <MailOutlined />
                            {formatLink(`mailto:${resumeData.contact.email}`, resumeData.contact.email)}
                        </Space>
                        <Space>
                            <LinkedinOutlined />
                            {formatLink(resumeData.contact.linkedin, "LinkedIn Profile")}
                        </Space>
                        <Space>
                            <GithubOutlined />
                            {formatLink(resumeData.contact.github, "GitHub Profile")}
                        </Space>
                        <Space>
                            <GlobalOutlined />
                            {formatLink(resumeData.contact.portfolio, "Pet Project - Schedule of my faculty")}
                        </Space>
                    </Space>
                </Card>

                {/* Summary */}
                <Card title="About" style={{ marginBottom: '20px' }}>
                    <Paragraph style={{ textAlign: 'justify', lineHeight: '1.6' }}>
                        {resumeData.summary}
                    </Paragraph>
                </Card>

                {/* Work Experience */}
                <Card title="Experience" style={{ marginBottom: '20px' }}>
                    {resumeData.workExperience.map((job, index) => (
                        <div key={index} style={{ marginBottom: index < resumeData.workExperience.length - 1 ? '24px' : '0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div>
                                    <Title level={4} style={{ margin: '0 0 4px 0', color: '#1890ff' }}>
                                        {job.title}
                                    </Title>
                                    <Text strong>{job.company}</Text>
                                </div>
                                <Tag color="blue" icon={<CalendarOutlined />}>
                                    {job.period}
                                </Tag>
                            </div>

                            {/* Job Links */}
                            {job.links && job.links.length > 0 && (
                                <div style={{ margin: '8px 0' }}>
                                    <Space wrap>
                                        {job.links.map((link, linkIndex) => (
                                            <Button
                                                key={linkIndex}
                                                type="link"
                                                icon={link.icon || <LinkOutlined />}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    padding: '4px 8px',
                                                    height: 'auto',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                {link.label}
                                            </Button>
                                        ))}
                                    </Space>
                                </div>
                            )}

                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                {job.description.map((item, idx) => (
                                    <li key={idx} style={{ marginBottom: '4px', lineHeight: '1.5' }}>
                                        <Text>{item}</Text>
                                    </li>
                                ))}
                            </ul>
                            {index < resumeData.workExperience.length - 1 && <Divider />}
                        </div>
                    ))}
                </Card>

                {/* Education */}
                <Card title="Education" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Title level={4} style={{ margin: '0 0 4px 0', color: '#1890ff' }}>
                                {resumeData.education.institution}
                            </Title>
                            <Text strong>{resumeData.education.degree}</Text>
                        </div>
                        <Tag color="green">
                            {resumeData.education.status === 'present' ? 'Present' : resumeData.education.status}
                        </Tag>
                    </div>
                </Card>

                {/* Skills and Technologies Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    {/* Skills */}
                    <Card title="Skills" size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {resumeData.skills.map((skill, index) => (
                                <Tag key={index} color="purple" style={{ margin: '2px' }}>
                                    {skill}
                                </Tag>
                            ))}
                        </Space>
                    </Card>

                    {/* Languages */}
                    <Card title="Languages" size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {resumeData.languages.map((lang, index) => (
                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text strong>{lang.name}</Text>
                                    <Tag color="orange">{lang.level}</Tag>
                                </div>
                            ))}
                        </Space>
                    </Card>
                </div>

                {/* Technologies */}
                <Card title="Technologies" style={{ marginBottom: '20px' }}>
                    <div>
                        {resumeData.technologies.map((tech, index) => (
                            <Tag
                                key={index}
                                color="blue"
                                style={{
                                    margin: '4px',
                                    padding: '4px 8px',
                                    borderRadius: '12px'
                                }}
                            >
                                {tech}
                            </Tag>
                        ))}
                    </div>
                </Card>
            </div>

            <Footer />
        </div>
    );
}