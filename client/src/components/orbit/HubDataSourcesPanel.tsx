import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Database, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Trash2,
  PlayCircle,
  ChevronRight,
  Loader2,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DataSourceConnection {
  id: number;
  name: string;
  description: string | null;
  baseUrl: string;
  status: 'active' | 'paused' | 'error';
  lastRunAt: string | null;
  lastError: string | null;
  createdAt: string;
  endpoint?: {
    id: number;
    path: string;
    responseMapping: { itemsPath?: string; idField?: string; titleField?: string } | null;
  };
  latestSnapshot?: {
    id: number;
    version: number;
    status: string;
    recordCount: number | null;
    fetchedAt: string;
  };
  snapshotCount: number;
}

interface HubDataSourcesPanelProps {
  businessSlug: string;
  planTier: 'free' | 'grow' | 'insight' | 'intelligence';
}

export function HubDataSourcesPanel({ businessSlug, planTier }: HubDataSourcesPanelProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<DataSourceConnection | null>(null);
  const queryClient = useQueryClient();

  const { data: connections, isLoading } = useQuery<DataSourceConnection[]>({
    queryKey: ["data-sources", businessSlug],
    queryFn: async () => {
      const response = await fetch(`/api/orbit/${businessSlug}/data-sources`);
      if (!response.ok) throw new Error("Failed to load data sources");
      return response.json();
    },
  });

  const triggerSnapshot = useMutation({
    mutationFn: async (connectionId: number) => {
      const response = await fetch(`/api/orbit/${businessSlug}/data-sources/${connectionId}/snapshot`, {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create snapshot");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-sources", businessSlug] });
    },
  });

  const deleteConnection = useMutation({
    mutationFn: async (connectionId: number) => {
      const response = await fetch(`/api/orbit/${businessSlug}/data-sources/${connectionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Failed to delete connection");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-sources", businessSlug] });
      setSelectedConnection(null);
    },
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'ready':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'error':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'processing':
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Data Sources</h2>
          <p className="text-zinc-400 text-sm">
            Connect external APIs to bring live data into your Orbit
          </p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          data-testid="button-add-data-source"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Connection
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </div>
      ) : connections?.length === 0 ? (
        <div className="border border-dashed border-zinc-700 rounded-xl p-12 text-center">
          <Database className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No data sources yet</h3>
          <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
            Connect an API to pull data into your Orbit. Your visitors can then ask questions about this data.
          </p>
          <Button 
            onClick={() => setShowAddModal(true)}
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800"
            data-testid="button-add-first-source"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Connection
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {connections?.map((conn) => (
            <div
              key={conn.id}
              className={cn(
                "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 orbit-hover cursor-pointer",
                selectedConnection?.id === conn.id && "ring-1 ring-pink-500/50"
              )}
              onClick={() => setSelectedConnection(conn)}
              data-testid={`data-source-${conn.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-zinc-800 rounded-lg">
                    <Database className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{conn.name}</h3>
                      {statusIcon(conn.status)}
                    </div>
                    <p className="text-sm text-zinc-400 mb-2">
                      {conn.endpoint?.path || 'No endpoint configured'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>{conn.snapshotCount} snapshots</span>
                      {conn.latestSnapshot && (
                        <span>
                          Last run: {new Date(conn.latestSnapshot.fetchedAt).toLocaleDateString()}
                        </span>
                      )}
                      {conn.latestSnapshot && conn.latestSnapshot.recordCount !== null && (
                        <span>{conn.latestSnapshot.recordCount} records</span>
                      )}
                    </div>
                    {conn.lastError && (
                      <p className="text-xs text-red-400 mt-2">{conn.lastError}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerSnapshot.mutate(conn.id);
                    }}
                    disabled={triggerSnapshot.isPending}
                    className="text-zinc-400 hover:text-white"
                    data-testid={`button-run-snapshot-${conn.id}`}
                  >
                    {triggerSnapshot.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PlayCircle className="w-4 h-4" />
                    )}
                  </Button>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddConnectionModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        businessSlug={businessSlug}
        onSuccess={() => {
          setShowAddModal(false);
          queryClient.invalidateQueries({ queryKey: ["data-sources", businessSlug] });
        }}
      />

      <ConnectionDetailModal
        connection={selectedConnection}
        onClose={() => setSelectedConnection(null)}
        onDelete={() => selectedConnection && deleteConnection.mutate(selectedConnection.id)}
        onRefresh={() => selectedConnection && triggerSnapshot.mutate(selectedConnection.id)}
        isDeleting={deleteConnection.isPending}
        isRefreshing={triggerSnapshot.isPending}
        businessSlug={businessSlug}
      />
    </div>
  );
}

interface AddConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessSlug: string;
  onSuccess: () => void;
}

function AddConnectionModal({ open, onOpenChange, businessSlug, onSuccess }: AddConnectionModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [endpointPath, setEndpointPath] = useState('');
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'api_key'>('none');
  const [authValue, setAuthValue] = useState('');
  const [itemsPath, setItemsPath] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setStep(1);
    setName('');
    setBaseUrl('');
    setEndpointPath('');
    setAuthType('none');
    setAuthValue('');
    setItemsPath('');
    setError('');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/orbit/${businessSlug}/data-sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          baseUrl,
          endpointPath,
          authType,
          authValue: authType !== 'none' ? authValue : undefined,
          responseMapping: itemsPath ? { itemsPath } : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create connection');
      }

      reset();
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Add Data Source</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Connect an external API to bring data into your Orbit
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-zinc-300">Connection Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Product Catalog"
                className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                data-testid="input-connection-name"
              />
            </div>
            <div>
              <Label className="text-zinc-300">API Base URL</Label>
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.example.com"
                className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                data-testid="input-base-url"
              />
              <p className="text-xs text-zinc-500 mt-1">Must be HTTPS</p>
            </div>
            <div>
              <Label className="text-zinc-300">Endpoint Path</Label>
              <Input
                value={endpointPath}
                onChange={(e) => setEndpointPath(e.target.value)}
                placeholder="/v1/products"
                className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                data-testid="input-endpoint-path"
              />
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!name || !baseUrl || !endpointPath}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
              data-testid="button-next-step"
            >
              Next: Authentication
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-zinc-300">Authentication Type</Label>
              <Select value={authType} onValueChange={(v: 'none' | 'bearer' | 'api_key') => setAuthType(v)}>
                <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="none">No Authentication</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="api_key">API Key</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {authType !== 'none' && (
              <div>
                <Label className="text-zinc-300">
                  {authType === 'bearer' ? 'Bearer Token' : 'API Key'}
                </Label>
                <Input
                  type="password"
                  value={authValue}
                  onChange={(e) => setAuthValue(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                  data-testid="input-auth-value"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 border-zinc-700"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
                data-testid="button-next-mapping"
              >
                Next: Data Mapping
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-zinc-300">Items Path (optional)</Label>
              <Input
                value={itemsPath}
                onChange={(e) => setItemsPath(e.target.value)}
                placeholder="e.g., data.items or results"
                className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                data-testid="input-items-path"
              />
              <p className="text-xs text-zinc-500 mt-1">
                The path to the array of items in the API response
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 border-zinc-700"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
                data-testid="button-create-connection"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Create Connection
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ConnectionDetailModalProps {
  connection: DataSourceConnection | null;
  onClose: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  isDeleting: boolean;
  isRefreshing: boolean;
  businessSlug: string;
}

function ConnectionDetailModal({ 
  connection, 
  onClose, 
  onDelete, 
  onRefresh, 
  isDeleting, 
  isRefreshing,
  businessSlug 
}: ConnectionDetailModalProps) {
  const { data: details } = useQuery({
    queryKey: ["data-source-detail", businessSlug, connection?.id],
    queryFn: async () => {
      const response = await fetch(`/api/orbit/${businessSlug}/data-sources/${connection!.id}`);
      if (!response.ok) throw new Error("Failed to load details");
      return response.json();
    },
    enabled: !!connection,
  });

  if (!connection) return null;

  return (
    <Dialog open={!!connection} onOpenChange={() => onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-pink-400" />
            {connection.name}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {connection.baseUrl}{connection.endpoint?.path}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="bg-gradient-to-r from-pink-500 to-purple-500"
              data-testid="button-run-snapshot-detail"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <PlayCircle className="w-4 h-4 mr-2" />
              )}
              Run Snapshot
            </Button>
            <Button
              variant="outline"
              onClick={onDelete}
              disabled={isDeleting}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              data-testid="button-delete-connection"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white mb-3">Snapshot History</h3>
            {details?.snapshots?.length === 0 ? (
              <p className="text-sm text-zinc-500">No snapshots yet. Run your first snapshot above.</p>
            ) : (
              <div className="space-y-2">
                {details?.snapshots?.slice(0, 10).map((snapshot: any) => (
                  <div
                    key={snapshot.id}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                    data-testid={`snapshot-${snapshot.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {snapshot.status === 'ready' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : snapshot.status === 'failed' ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400" />
                      )}
                      <div>
                        <p className="text-sm text-white">Version {snapshot.version}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(snapshot.fetchedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {snapshot.recordCount !== null && (
                        <p className="text-sm text-zinc-400">{snapshot.recordCount} records</p>
                      )}
                      {snapshot.error && (
                        <p className="text-xs text-red-400">{snapshot.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
