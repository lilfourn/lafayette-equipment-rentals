export const dynamic = 'force-dynamic';

import type { Machine } from "@/components/machine-card";
import MachineContactForm from "@/components/machine-contact-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: { locale: string; machineId: string };
}

const MACHINE_IMAGE_BASE_URL =
  process.env.MACHINE_IMAGE_BASE_URL ||
  "https://kimberrubblstg.blob.core.windows.net";

async function getMachine(machineId: string): Promise<Machine | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/machine/${machineId}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return (await res.json()) as Machine;
  } catch {
    return null;
  }
}

function getFirstImage(machine: Machine | null): string | undefined {
  if (!machine) return undefined;
  const images =
    (machine.thumbnails && machine.thumbnails.length > 0
      ? machine.thumbnails
      : machine.images) || [];
  for (const p of images) {
    if (
      typeof p === "string" &&
      (p.startsWith("http://") || p.startsWith("https://"))
    )
      return p;
    if (typeof p === "string") {
      const corrected = p.startsWith("/") ? p : `/${p}`;
      return `${MACHINE_IMAGE_BASE_URL}${corrected}`;
    }
  }
  return undefined;
}

export default async function MachineContactPage({ params }: PageProps) {
  const { machineId } = await params;
  const machine = await getMachine(machineId);
  const imageUrl = getFirstImage(machine);
  const titleParts = [machine?.year, machine?.make, machine?.model].filter(
    Boolean
  );
  const machineName =
    (titleParts.length > 0 ? titleParts.join(" ") : machine?.displayName) ||
    "Equipment";

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-gray-900">
        <div className="relative z-10 container mx-auto px-4 py-12">
          <nav className="flex items-center space-x-2 text-sm mb-6 text-white/70">
            <Link
              href="/"
              className="hover:text-yellow-400 transition-colors font-semibold uppercase tracking-wide"
            >
              HOME
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/equipment-rental"
              className="hover:text-yellow-400 transition-colors font-semibold uppercase tracking-wide"
            >
              EQUIPMENT
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-yellow-400 font-bold uppercase tracking-wide">
              Contact
            </span>
          </nav>
          <div className="flex items-start gap-4">
            {imageUrl && (
              <div className="hidden sm:block">
                <Image
                  src={imageUrl}
                  alt={machineName}
                  width={96}
                  height={72}
                  className="rounded-md object-cover w-24 h-18"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight uppercase">
                Send a Message
              </h1>
              <p className="text-white/90">
                About:{" "}
                <span className="text-yellow-400 font-bold">{machineName}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MachineContactForm
              machineId={machineId}
              machineName={machineName}
              machineYear={(machine?.year as any) || undefined}
              machineMake={machine?.make}
              machineModel={machine?.model}
              machineType={machine?.primaryType}
              imageUrl={imageUrl}
            />
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 overflow-hidden sticky top-24">
              <CardHeader className="bg-white border-b-4 border-turquoise-500">
                <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">
                  Need Immediate Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 py-6">
                <a href="tel:+13375452935">
                  <Button className="w-full bg-turquoise-600 hover:bg-turquoise-700">
                    Call (337) 545-2935
                  </Button>
                </a>
                <Link href={`/equipment-rental/machines/${machineId}`}>
                  <Button variant="outline" className="w-full">
                    Back to Machine
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
