'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

export function ImportDataDialog({ type = 'Lead', apiUrl = '/api/leads/import', onImportSuccess }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
            setError('Please upload a valid CSV file.');
            return;
        }

        setFile(selectedFile);
        setError(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            const lines = content.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            const data = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                const item = {};
                headers.forEach((header, index) => {
                    item[header] = values[index];
                });
                return item;
            });

            setPreview(data.slice(0, 5)); // Show first 5 for preview
        };
        reader.readAsText(selectedFile);
    };

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);
        setError(null);

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const content = event.target.result;
                const lines = content.split('\n').filter(line => line.trim());
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

                const items = lines.slice(1).map(line => {
                    const values = line.split(',').map(v => v.trim());
                    const item = {};
                    headers.forEach((header, index) => {
                        item[header] = values[index];
                    });
                    return item;
                });

                const payloadKey = type.toLowerCase() === 'lead' ? 'leads' : 'contacts';

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ [payloadKey]: items })
                });

                if (response.ok) {
                    const data = await response.json();
                    setSuccess(`Successfully imported ${data.count} ${type.toLowerCase()}s.`);
                    if (onImportSuccess) onImportSuccess();
                    setTimeout(() => {
                        setOpen(false);
                        resetState();
                    }, 2000);
                } else {
                    const data = await response.json();
                    setError(data.error || `Failed to import ${type.toLowerCase()}s.`);
                }
            };
            reader.readAsText(file);
        } catch (err) {
            setError('An error occurred during import.');
            console.error(err);
        } finally {
            setImporting(false);
        }
    };

    const resetState = () => {
        setFile(null);
        setPreview([]);
        setError(null);
        setSuccess(null);
    };

    const expectedHeaders = type.toLowerCase() === 'lead'
        ? 'name, company, email, phone, value, source, priority'
        : 'name, company, email, phone, role';

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetState(); }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3 text-xs flex items-center gap-2">
                    <Upload size={14} /> {t('common.import')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Import {type}s</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to import multiple {type.toLowerCase()}s at once.
                        Headers should include: <code>{expectedHeaders}</code>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {!file ? (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-10 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept=".csv"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                            />
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-full mb-3 text-indigo-600">
                                <FileText size={24} />
                            </div>
                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground mt-1">CSV files only</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-md text-indigo-600">
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                        <span className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={resetState} className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                                    Remove
                                </Button>
                            </div>

                            {preview.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preview (First {preview.length} rows)</p>
                                    <div className="border border-border rounded-md overflow-hidden bg-white dark:bg-slate-950">
                                        <table className="w-full text-[10px] border-collapse">
                                            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-border">
                                                <tr>
                                                    <th className="px-2 py-1 text-left font-bold">Name</th>
                                                    <th className="px-2 py-1 text-left font-bold">Company</th>
                                                    <th className="px-2 py-1 text-left font-bold">{type.toLowerCase() === 'lead' ? 'Value' : 'Role'}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {preview.map((row, i) => (
                                                    <tr key={i} className="border-b border-border/50 last:border-0 font-medium">
                                                        <td className="px-2 py-1 truncate max-w-[100px]">{row.name}</td>
                                                        <td className="px-2 py-1 truncate max-w-[100px]">{row.company || '-'}</td>
                                                        <td className="px-2 py-1">{type.toLowerCase() === 'lead' ? (row.value || '0') : (row.role || '-')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                            <CheckCircle2 size={14} />
                            <span>{success}</span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={importing}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!file || importing || !!success}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]"
                    >
                        {importing ? (
                            <>
                                <Loader2 size={14} className="mr-2 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            `Import ${type}s`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
