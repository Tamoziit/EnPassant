import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";

const Footer = () => {
	return (
		<footer className="glassmorphic !rounded-none py-4 z-10">
			<div className="max-w-screen-lg mx-auto px-6 text-center">
				<div className="flex justify-center space-x-6 mb-4">
					<a
						href="mailto:yourmail@gmail.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-gray-300 hover:text-blue-600 transition-colors"
						aria-label="Email"
					>
						<FaEnvelope size={24} />
					</a>
					<a
						href="https://www.linkedin.com/in/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-gray-300 hover:text-blue-600 transition-colors"
						aria-label="LinkedIn"
					>
						<FaLinkedin size={24} />
					</a>
					<a
						href="https://github.com/your_username"
						target="_blank"
						rel="noopener noreferrer"
						className="text-gray-300 hover:text-blue-600 transition-colors"
						aria-label="GitHub"
					>
						<FaGithub size={24} />
					</a>
					<a
						href="https://leetcode.com/u/yourusername/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-gray-300 hover:text-blue-500 transition-colors"
						aria-label="LeetCode"
					>
						<SiLeetcode size={24} />
					</a>
				</div>
				<p className="text-sm text-gray-400">
					&copy; 2024, Tamojit Das. All rights reserved.
				</p>
			</div>
		</footer>
	);
};

export default Footer;