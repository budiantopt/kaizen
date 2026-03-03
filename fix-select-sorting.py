import re
with open("components/dashboard/TaskModal.tsx", "r") as f:
    text = f.read()
    
# fixing sortedAssignees
old_chunk1 = """                        <div className="flex flex-wrap gap-2 mb-3">
                            {selectedAssignees
                                .map(id => profiles.find(p => p.id === id))
                                .sort((a, b) => (a?.full_name || '').localeCompare(b?.full_name || ''))
                                .map(profile => {"""
new_chunk1 = """                        <div className="flex flex-wrap gap-2 mb-3">
                            {selectedAssignees
                                .map(id => profiles.find(p => p.id === id))
                                .sort((a, b) => (a?.full_name || '').localeCompare(b?.full_name || ''))
                                .map(profile => {"""

old_chunk2 = """                        <div className="border border-border rounded-lg p-2 max-h-[150px] overflow-y-auto bg-secondary/30">
                            {[...profiles]
                                .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
                                .map(profile => {"""
new_chunk2 = """                        <div className="border border-border rounded-lg p-2 max-h-[150px] overflow-y-auto bg-secondary/30">
                            {[...profiles]
                                .sort((a, b) => (a.full_name || a.email || '').localeCompare(b.full_name || b.email || ''))
                                .map(profile => {"""

if old_chunk2 in text:
    print("Found chunk 2!")
    text = text.replace(old_chunk2, new_chunk2)
else:
    print("Chunk 2 not found!")

with open("components/dashboard/TaskModal.tsx", "w") as f:
    f.write(text)
