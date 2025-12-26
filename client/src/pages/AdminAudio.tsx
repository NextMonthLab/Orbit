import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, AudioTrack, ScannedAudioFile } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Music, Upload, FolderSearch, Play, Pause, Trash2, Pencil, Check, X, Loader2, Volume2 } from "lucide-react";

const MOOD_OPTIONS = ["tense", "upbeat", "mysterious", "romantic", "sad", "action", "calm", "epic", "playful", "dark"];
const GENRE_OPTIONS = ["cinematic", "electronic", "ambient", "pop", "orchestral", "rock", "jazz", "hip-hop", "acoustic", "thriller"];

export default function AdminAudio() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);
  const [editingTrack, setEditingTrack] = useState<AudioTrack | null>(null);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [scannedFiles, setScannedFiles] = useState<ScannedAudioFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState({ title: "", artist: "", moodTags: [] as string[], genreTags: [] as string[] });
  const [moodFilter, setMoodFilter] = useState<string>("");
  const [genreFilter, setGenreFilter] = useState<string>("");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: tracks, isLoading } = useQuery({
    queryKey: ["audioTracks", moodFilter, genreFilter],
    queryFn: () => api.getAudioTracks(moodFilter || undefined, genreFilter || undefined),
  });

  const scanMutation = useMutation({
    mutationFn: () => api.scanAudioFiles(),
    onSuccess: (data) => {
      setScannedFiles(data.files);
      setSelectedFiles(new Set(data.files.map(f => f.path)));
      if (data.files.length === 0) {
        toast({ title: "No new files found", description: "All audio files in uploads/audio are already imported." });
        setShowScanDialog(false);
      }
    },
    onError: (error: any) => {
      toast({ title: "Scan failed", description: error.message, variant: "destructive" });
    },
  });

  const importMutation = useMutation({
    mutationFn: (files: ScannedAudioFile[]) => api.importAudioFiles(files),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["audioTracks"] });
      toast({ title: "Import successful", description: `Imported ${data.count} track(s)` });
      setShowScanDialog(false);
      setScannedFiles([]);
      setSelectedFiles(new Set());
    },
    onError: (error: any) => {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata: typeof uploadMetadata }) => 
      api.uploadAudioFile(file, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audioTracks"] });
      toast({ title: "Upload successful" });
      setShowUploadDialog(false);
      setUploadFile(null);
      setUploadMetadata({ title: "", artist: "", moodTags: [], genreTags: [] });
    },
    onError: (error: any) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<AudioTrack> }) => 
      api.updateAudioTrack(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audioTracks"] });
      toast({ title: "Track updated" });
      setEditingTrack(null);
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteAudioTrack(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audioTracks"] });
      toast({ title: "Track deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });

  const handlePlayPause = (track: AudioTrack) => {
    if (playingTrackId === track.id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.fileUrl;
        audioRef.current.play();
        setPlayingTrackId(track.id);
      }
    }
  };

  const handleScan = () => {
    setShowScanDialog(true);
    scanMutation.mutate();
  };

  const handleImport = () => {
    const filesToImport = scannedFiles.filter(f => selectedFiles.has(f.path));
    if (filesToImport.length > 0) {
      importMutation.mutate(filesToImport);
    }
  };

  const toggleFileSelection = (path: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(path)) {
      newSelection.delete(path);
    } else {
      newSelection.add(path);
    }
    setSelectedFiles(newSelection);
  };

  const toggleMoodTag = (tag: string, current: string[], setter: (tags: string[]) => void) => {
    if (current.includes(tag)) {
      setter(current.filter(t => t !== tag));
    } else {
      setter([...current, tag]);
    }
  };

  if (!user?.isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <h2 className="text-2xl font-display font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You need admin privileges to access this page.</p>
          <Link href="/"><Button data-testid="button-go-home">Go Home</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} />
      
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                <Music className="w-6 h-6" /> Audio Library
              </h1>
              <p className="text-muted-foreground text-sm">Manage background music for your stories</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleScan} variant="outline" data-testid="button-scan">
              <FolderSearch className="w-4 h-4 mr-2" /> Scan Folder
            </Button>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-upload">
                  <Upload className="w-4 h-4 mr-2" /> Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Audio Track</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Audio File (MP3)</Label>
                    <Input 
                      type="file" 
                      accept=".mp3,audio/mpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadFile(file);
                          setUploadMetadata(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, "") }));
                        }
                      }}
                      data-testid="input-upload-file"
                    />
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input 
                      value={uploadMetadata.title}
                      onChange={(e) => setUploadMetadata(prev => ({ ...prev, title: e.target.value }))}
                      data-testid="input-upload-title"
                    />
                  </div>
                  <div>
                    <Label>Artist</Label>
                    <Input 
                      value={uploadMetadata.artist}
                      onChange={(e) => setUploadMetadata(prev => ({ ...prev, artist: e.target.value }))}
                      data-testid="input-upload-artist"
                    />
                  </div>
                  <div>
                    <Label>Mood Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {MOOD_OPTIONS.map(mood => (
                        <Badge 
                          key={mood}
                          variant={uploadMetadata.moodTags.includes(mood) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleMoodTag(mood, uploadMetadata.moodTags, (tags) => setUploadMetadata(prev => ({ ...prev, moodTags: tags })))}
                        >
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Genre Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {GENRE_OPTIONS.map(genre => (
                        <Badge 
                          key={genre}
                          variant={uploadMetadata.genreTags.includes(genre) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleMoodTag(genre, uploadMetadata.genreTags, (tags) => setUploadMetadata(prev => ({ ...prev, genreTags: tags })))}
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    disabled={!uploadFile || uploadMutation.isPending}
                    onClick={() => uploadFile && uploadMutation.mutate({ file: uploadFile, metadata: uploadMetadata })}
                    data-testid="button-confirm-upload"
                  >
                    {uploadMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Upload Track
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Select value={moodFilter || "all"} onValueChange={(v) => setMoodFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-36" data-testid="select-mood-filter">
              <SelectValue placeholder="All moods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All moods</SelectItem>
              {MOOD_OPTIONS.map(mood => (
                <SelectItem key={mood} value={mood}>{mood}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={genreFilter || "all"} onValueChange={(v) => setGenreFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-36" data-testid="select-genre-filter">
              <SelectValue placeholder="All genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genres</SelectItem>
              {GENRE_OPTIONS.map(genre => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {(moodFilter || genreFilter) && (
            <Button variant="ghost" size="sm" onClick={() => { setMoodFilter(""); setGenreFilter(""); }}>
              Clear filters
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !tracks?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Volume2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No audio tracks yet</h3>
              <p className="text-muted-foreground mb-4">Upload MP3 files or scan the uploads/audio folder</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleScan} variant="outline">
                  <FolderSearch className="w-4 h-4 mr-2" /> Scan Folder
                </Button>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="w-4 h-4 mr-2" /> Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tracks.map(track => (
              <Card key={track.id} className="overflow-hidden" data-testid={`track-card-${track.id}`}>
                <div className="flex items-center gap-4 p-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0"
                    onClick={() => handlePlayPause(track)}
                    data-testid={`button-play-${track.id}`}
                  >
                    {playingTrackId === track.id ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    {editingTrack?.id === track.id ? (
                      <div className="space-y-2">
                        <Input 
                          value={editingTrack.title}
                          onChange={(e) => setEditingTrack({ ...editingTrack, title: e.target.value })}
                          className="font-medium"
                          data-testid="input-edit-title"
                        />
                        <Input 
                          value={editingTrack.artist || ""}
                          onChange={(e) => setEditingTrack({ ...editingTrack, artist: e.target.value })}
                          placeholder="Artist"
                          data-testid="input-edit-artist"
                        />
                        <div>
                          <Label className="text-xs">Moods</Label>
                          <div className="flex flex-wrap gap-1">
                            {MOOD_OPTIONS.map(mood => (
                              <Badge 
                                key={mood}
                                variant={editingTrack.moodTags.includes(mood) ? "default" : "outline"}
                                className="cursor-pointer text-xs"
                                onClick={() => setEditingTrack({
                                  ...editingTrack,
                                  moodTags: editingTrack.moodTags.includes(mood)
                                    ? editingTrack.moodTags.filter(t => t !== mood)
                                    : [...editingTrack.moodTags, mood]
                                })}
                              >
                                {mood}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Genres</Label>
                          <div className="flex flex-wrap gap-1">
                            {GENRE_OPTIONS.map(genre => (
                              <Badge 
                                key={genre}
                                variant={editingTrack.genreTags.includes(genre) ? "default" : "outline"}
                                className="cursor-pointer text-xs"
                                onClick={() => setEditingTrack({
                                  ...editingTrack,
                                  genreTags: editingTrack.genreTags.includes(genre)
                                    ? editingTrack.genreTags.filter(t => t !== genre)
                                    : [...editingTrack.genreTags, genre]
                                })}
                              >
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium truncate" data-testid={`text-track-title-${track.id}`}>{track.title}</h3>
                        {track.artist && <p className="text-sm text-muted-foreground">{track.artist}</p>}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {track.moodTags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                          {track.genreTags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    {editingTrack?.id === track.id ? (
                      <>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => updateMutation.mutate({ id: track.id, updates: editingTrack })}
                          disabled={updateMutation.isPending}
                          data-testid="button-save-edit"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => setEditingTrack(null)}
                          data-testid="button-cancel-edit"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => setEditingTrack(track)}
                          data-testid={`button-edit-${track.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => {
                            if (confirm("Delete this track?")) {
                              deleteMutation.mutate(track.id);
                            }
                          }}
                          data-testid={`button-delete-${track.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Audio Files</DialogTitle>
          </DialogHeader>
          
          {scanMutation.isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3">Scanning uploads/audio...</span>
            </div>
          ) : scannedFiles.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No unimported files found</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Found {scannedFiles.length} new file(s) in uploads/audio</p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {scannedFiles.map(file => (
                  <div key={file.path} className="flex items-center gap-3 p-2 rounded border">
                    <Checkbox 
                      checked={selectedFiles.has(file.path)}
                      onCheckedChange={() => toggleFileSelection(file.path)}
                      data-testid={`checkbox-file-${file.filename}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{file.suggestedTitle}</p>
                      <p className="text-xs text-muted-foreground truncate">{file.filename}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{selectedFiles.size} selected</span>
                <Button 
                  onClick={handleImport}
                  disabled={selectedFiles.size === 0 || importMutation.isPending}
                  data-testid="button-confirm-import"
                >
                  {importMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Import Selected
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
