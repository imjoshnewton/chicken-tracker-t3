"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { trpc } from "@utils/trpc";
import { Flock } from "@lib/db/schema-postgres";
import { usePathname, useRouter } from "next/navigation";

// FlockSelect component
export default function FlockSelect() {
  const router = useRouter();
  const path = usePathname();

  const { data: flocks } = trpc.flocks.getFlocks.useQuery() as { data: Array<{id: string, name: string}> | undefined };

  const handleChange = (value: string) => {
    if (value === "All") router.push(path);
    else router.push(`${path}?flockId=${value}`);
  };

  return (
    <Select defaultValue={"All"} onValueChange={handleChange}>
      <SelectTrigger className="max-w-max">
        <SelectValue placeholder={`All Flocks`} />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="All">All Flocks</SelectItem>
        {flocks?.map((flock) => (
          <SelectItem key={flock.id} value={flock.id}>
            {flock.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
