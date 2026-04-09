interface TabAccountProps {
    profile: any;
    profileForm: any;
    setProfileForm: (form: any) => void;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    handleUpdate: (e: React.FormEvent) => void;
}

export default function TabAccount({
    profile,
    profileForm,
    setProfileForm,
    isEditing,
    setIsEditing,
    handleUpdate
}: TabAccountProps) {
    return (
        <div className="p-4 md:p-8 max-w-xl mx-auto md:mx-0">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 md:mb-8">Account Registry</h2>
            <form onSubmit={handleUpdate} className="space-y-8 px-2">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Identity Name</label>
                    <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-foreground disabled:opacity-50"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Mobile Link</label>
                    <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-foreground disabled:opacity-50"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Email Address (Secured)</label>
                    <div className="bg-foreground/5 rounded-lg px-4 py-3 text-sm text-foreground/40 font-mono italic">{profile?.email}</div>
                </div>
                <div className="pt-6">
                    {isEditing ? (
                        <div className="flex gap-3">
                            <button type="submit" className="flex-1 bg-foreground text-background px-8 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-foreground/80 transition-all rounded-lg">Save Registry</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 border border-foreground/20 px-8 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-foreground/5 transition-all rounded-lg">Cancel</button>
                        </div>
                    ) : (
                        <button type="button" onClick={() => setIsEditing(true)} className="w-full bg-foreground text-background px-8 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-foreground/80 transition-all rounded-lg shadow-sm">
                            Modify Details
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
