import Link from 'next/link';

type FeatureCardProps = {
    href: string;
    icon: string;
    title: string;
    description: string;
};

export default function FeatureCard({ href, icon, title, description }: FeatureCardProps) {
    return (
        <Link href={href} className="feature-card">
            <span className="feature-card-icon" aria-hidden="true">{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
        </Link>
    );
}