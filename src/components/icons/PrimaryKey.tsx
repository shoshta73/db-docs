import { Badge } from "../ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";

export default function () {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Badge>🔑</Badge>
				</TooltipTrigger>
				<TooltipContent>
					<p>Primary Key</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
