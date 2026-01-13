import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, RefreshCw, Wifi, WifiOff, Moon, Trash2, Edit2, Check, X, Copy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface OrbitCube {
  id: number;
  cubeUuid: string;
  orbitSlug: string;
  name: string;
  status: 'pending_pairing' | 'online' | 'sleeping' | 'offline' | 'revoked';
  pairingCode: string | null;
  pairingCodeExpiresAt: string | null;
  sleepTimeoutMinutes: number;
  lastSeenAt: string | null;
  createdAt: string;
}

interface HubCubesPanelProps {
  businessSlug: string;
  planTier: 'free' | 'grow' | 'insight' | 'intelligence';
}

const statusConfig = {
  pending_pairing: { label: 'Pending Pairing', color: 'text-amber-400 bg-amber-400/10', icon: Clock },
  online: { label: 'Online', color: 'text-emerald-400 bg-emerald-400/10', icon: Wifi },
  sleeping: { label: 'Sleeping', color: 'text-blue-400 bg-blue-400/10', icon: Moon },
  offline: { label: 'Offline', color: 'text-zinc-400 bg-zinc-400/10', icon: WifiOff },
  revoked: { label: 'Revoked', color: 'text-red-400 bg-red-400/10', icon: X },
};

export function HubCubesPanel({ businessSlug, planTier }: HubCubesPanelProps) {
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderStep, setOrderStep] = useState(1);
  const [selectedCube, setSelectedCube] = useState<OrbitCube | null>(null);
  const [editingName, setEditingName] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cubes = [], isLoading } = useQuery<OrbitCube[]>({
    queryKey: ['/api/orbit', businessSlug, 'cubes'],
    queryFn: async () => {
      const res = await fetch(`/api/orbit/${businessSlug}/cubes`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch cubes');
      return res.json();
    },
  });

  const orderMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/orbit/${businessSlug}/cubes/checkout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to create order');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Order Placed",
          description: data.message || "Your Orbit Cube order has been placed.",
        });
        setOrderModalOpen(false);
        setOrderStep(1);
        queryClient.invalidateQueries({ queryKey: ['/api/orbit', businessSlug, 'cubes'] });
      }
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ cubeId, name }: { cubeId: number; name: string }) => {
      const res = await fetch(`/api/orbit/${businessSlug}/cubes/${cubeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to rename cube');
      return res.json();
    },
    onSuccess: () => {
      setEditingName(null);
      queryClient.invalidateQueries({ queryKey: ['/api/orbit', businessSlug, 'cubes'] });
    },
  });

  const updateSleepMutation = useMutation({
    mutationFn: async ({ cubeId, sleepTimeoutMinutes }: { cubeId: number; sleepTimeoutMinutes: number }) => {
      const res = await fetch(`/api/orbit/${businessSlug}/cubes/${cubeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sleepTimeoutMinutes }),
      });
      if (!res.ok) throw new Error('Failed to update sleep timeout');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orbit', businessSlug, 'cubes'] });
    },
  });

  const regenerateCodeMutation = useMutation({
    mutationFn: async (cubeId: number) => {
      const res = await fetch(`/api/orbit/${businessSlug}/cubes/${cubeId}/pairing-code/regenerate`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to regenerate pairing code');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orbit', businessSlug, 'cubes'] });
      toast({ title: "Pairing code regenerated" });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (cubeId: number) => {
      const res = await fetch(`/api/orbit/${businessSlug}/cubes/${cubeId}/revoke`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to revoke cube');
      return res.json();
    },
    onSuccess: () => {
      setRevokeConfirmOpen(false);
      setSelectedCube(null);
      queryClient.invalidateQueries({ queryKey: ['/api/orbit', businessSlug, 'cubes'] });
      toast({ title: "Cube revoked", description: "The device can no longer access your Orbit." });
    },
  });

  const copyPairingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: "Pairing code copied to clipboard" });
  };

  const formatLastSeen = (date: string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  const activeCubes = cubes.filter(c => c.status !== 'revoked');

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {activeCubes.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
            <Box className="h-10 w-10 text-pink-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Bring Orbit into the room</h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-lg mx-auto">
            The Orbit Cube is a dedicated, always-on interface for your business intelligence — 
            voice-enabled, secure, and built to live on your desk or boardroom table.
          </p>
          
          <div className="flex gap-4 justify-center mb-12">
            <Button 
              onClick={() => setOrderModalOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 px-8"
              data-testid="button-order-cube"
            >
              Order Orbit Cube
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <Wifi className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Always-on intelligence</h3>
              <p className="text-zinc-400 text-sm">
                Your latest snapshots and insights, ready without logging in.
              </p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Box className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Voice-first access</h3>
              <p className="text-zinc-400 text-sm">
                Ask questions, explore data, and get answers out loud.
              </p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <RefreshCw className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">One brain, many surfaces</h3>
              <p className="text-zinc-400 text-sm">
                Same Orbit experience as web — now physical.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-1">Orbit Cubes</h2>
              <p className="text-zinc-400 text-sm">
                Manage your physical kiosk devices
              </p>
            </div>
            <Button 
              onClick={() => setOrderModalOpen(true)}
              variant="outline"
              className="border-zinc-700"
              data-testid="button-order-another-cube"
            >
              Order Another Cube
            </Button>
          </div>

          <div className="space-y-4">
            {activeCubes.map((cube) => {
              const status = statusConfig[cube.status];
              const StatusIcon = status.icon;
              
              return (
                <div 
                  key={cube.id}
                  className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700"
                  data-testid={`cube-card-${cube.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-zinc-700/50 flex items-center justify-center">
                        <Box className="h-6 w-6 text-zinc-400" />
                      </div>
                      <div className="flex-1">
                        {editingName === cube.id ? (
                          <div className="flex items-center gap-2 mb-2">
                            <Input
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="h-8 w-48 bg-zinc-900"
                              autoFocus
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => renameMutation.mutate({ cubeId: cube.id, name: newName })}
                            >
                              <Check className="h-4 w-4 text-emerald-400" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => setEditingName(null)}
                            >
                              <X className="h-4 w-4 text-zinc-400" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-medium">{cube.name}</h3>
                            <button
                              onClick={() => {
                                setEditingName(cube.id);
                                setNewName(cube.name);
                              }}
                              className="text-zinc-500 hover:text-white"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs", status.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                          <span className="text-zinc-500 text-xs">
                            Last active: {formatLastSeen(cube.lastSeenAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {cube.status === 'pending_pairing' && cube.pairingCode && (
                        <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-3 py-2">
                          <span className="text-zinc-400 text-xs">Pairing code:</span>
                          <code className="font-mono text-pink-400 text-sm tracking-wider">{cube.pairingCode}</code>
                          <button
                            onClick={() => copyPairingCode(cube.pairingCode!)}
                            className="text-zinc-500 hover:text-white"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-700/50 flex items-center gap-4">
                    {cube.status === 'pending_pairing' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => regenerateCodeMutation.mutate(cube.id)}
                        disabled={regenerateCodeMutation.isPending}
                        className="text-xs"
                      >
                        <RefreshCw className={cn("h-3 w-3 mr-1.5", regenerateCodeMutation.isPending && "animate-spin")} />
                        Regenerate Code
                      </Button>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-xs">Sleep after:</span>
                      <Select
                        value={cube.sleepTimeoutMinutes.toString()}
                        onValueChange={(v) => updateSleepMutation.mutate({ cubeId: cube.id, sleepTimeoutMinutes: parseInt(v) })}
                      >
                        <SelectTrigger className="h-7 w-24 text-xs bg-zinc-900 border-zinc-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 min</SelectItem>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="480">8 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex-1" />
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedCube(cube);
                        setRevokeConfirmOpen(true);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3 mr-1.5" />
                      Revoke
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          {orderStep === 1 && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">Orbit Cube</DialogTitle>
                <DialogDescription>
                  A dedicated physical interface for Orbit. Always on. Voice enabled. Built for decision-making, not dashboards.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <ul className="space-y-3 text-sm text-zinc-300">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    Pre-configured Orbit Cube (Raspberry Pi 5 based)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    Secure device pairing to your Orbit Business Hub
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    Automatic updates and monitoring
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    Voice interaction (text + speech)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    Kiosk-mode Orbit experience
                  </li>
                </ul>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setOrderStep(2)}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  Continue
                </Button>
              </DialogFooter>
            </>
          )}
          
          {orderStep === 2 && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">Pricing</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-medium">Hardware (one-off)</span>
                    <span className="text-2xl font-bold text-white">£299</span>
                  </div>
                  <p className="text-zinc-400 text-sm">Pre-configured Orbit Cube device</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-medium">Subscription (monthly)</span>
                    <span className="text-2xl font-bold text-white">£29<span className="text-sm font-normal text-zinc-400">/month</span></span>
                  </div>
                  <p className="text-zinc-400 text-sm">Per Cube. Connectivity, voice, updates.</p>
                </div>
                <p className="text-zinc-500 text-xs">
                  Requires an active Orbit Business subscription. Subscription covers secure connectivity, device management, voice features, and ongoing Orbit integration.
                </p>
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setOrderStep(1)} className="border-zinc-700">
                  Back
                </Button>
                <Button
                  onClick={() => orderMutation.mutate()}
                  disabled={orderMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  {orderMutation.isPending ? 'Processing...' : 'Order Now'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={revokeConfirmOpen} onOpenChange={setRevokeConfirmOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Revoke Device</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke "{selectedCube?.name}"? The device will no longer be able to access your Orbit. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setRevokeConfirmOpen(false)} className="border-zinc-700">
              Cancel
            </Button>
            <Button
              onClick={() => selectedCube && revokeMutation.mutate(selectedCube.id)}
              disabled={revokeMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {revokeMutation.isPending ? 'Revoking...' : 'Revoke Device'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
