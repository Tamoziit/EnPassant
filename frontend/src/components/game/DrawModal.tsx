import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DrawModalProps } from "@/types";
import { FaCheck, FaTimes } from "react-icons/fa";

const DrawModal = ({ onAccept, onDecline }: DrawModalProps) => {
	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
			<Card className="bg-gray-900 border-gray-700 text-gray-200 shadow-2xl w-full max-w-sm mx-4">
				<CardHeader>
					<CardTitle className="text-lg text-center font-semibold">
						Opponent Offered a Draw
					</CardTitle>
				</CardHeader>

				<CardContent className="flex flex-col items-center gap-4">
					<p className="text-sm text-gray-400 text-center">
						Would you like to accept the draw and end the game?
					</p>

					<div className="flex items-center justify-center gap-6 mt-2">
						<Button
							variant="default"
							className="bg-green-600 hover:bg-green-700 flex items-center gap-2 cursor-pointer"
							onClick={onAccept}
						>
							<FaCheck className="text-white" />
							Accept
						</Button>

						<Button
							variant="destructive"
							className="bg-red-600 hover:bg-red-700 flex items-center gap-2 cursor-pointer"
							onClick={onDecline}
						>
							<FaTimes className="text-white" />
							Decline
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default DrawModal;