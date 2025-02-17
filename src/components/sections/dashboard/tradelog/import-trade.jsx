import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import Cookies from "js-cookie";

export function ImportTradeDialog({
  open,
  onOpenChange,
  onImportComplete,
  defaultBrokerage,
}) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      let data = [];

      if (file.name.endsWith(".csv")) {
        data = parseCSV(content);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        data = parseExcel(content);
      }

      setPreviewData(data.slice(0, 5)); // Preview first 5 rows
      initializeColumnMapping(Object.keys(data[0]));
    };
    reader.readAsBinaryString(file);
  };

  const parseCSV = (content) => {
    const lines = content.split("\n");
    const headers = lines[0].split(",");
    return lines.slice(1).map((line) => {
      const values = line.split(",");
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index]?.trim();
        return obj;
      }, {});
    });
  };

  const parseExcel = (content) => {
    const workbook = XLSX.read(content, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  };

  const initializeColumnMapping = (columns) => {
    const initialMapping = {};
    columns.forEach((column) => {
      initialMapping[column] = "";
    });
    setColumnMapping(initialMapping);
  };

  const handleColumnMappingChange = (originalColumn, mappedColumn) => {
    setColumnMapping((prev) => ({ ...prev, [originalColumn]: mappedColumn }));
  };

 const handleImport = async () => {
   if (!file) return;

   setImporting(true);
   const formData = new FormData();
   formData.append("file", file);
   formData.append("columnMapping", JSON.stringify(columnMapping));
   formData.append("defaultBrokerage", defaultBrokerage.toString());

   try {
     // Retrieve the token from js-cookie
     const token = Cookies.get("token");

     // Send the request with the bearer token
     await axios.post(
       `${process.env.NEXT_PUBLIC_API_URL}/api/import`,
       formData,
       {
         headers: {
           "Content-Type": "multipart/form-data",
           // Add Authorization header with bearer token
           Authorization: `Bearer ${token}`,
         },
       }
     );
     onImportComplete();
     onOpenChange(false);
   } catch (error) {
     console.error("Error importing trades:", error);
     // Handle error (e.g., show error message to user)
   } finally {
     setImporting(false);
   }
 };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Import Trades</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file-upload" className="col-span-1">
              Select File
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="col-span-3"
            />
          </div>
          {previewData.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(previewData[0]).map((column) => (
                        <TableHead key={column}>
                          <Select
                            value={columnMapping[column]}
                            onValueChange={(value) =>
                              handleColumnMappingChange(column, value)
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="instrumentName">
                                Instrument Name
                              </SelectItem>
                              <SelectItem value="quantity">Quantity</SelectItem>
                              <SelectItem value="buyingPrice">
                                Buying Price
                              </SelectItem>
                              <SelectItem value="sellingPrice">
                                Selling Price
                              </SelectItem>
                              <SelectItem value="action">Action</SelectItem>
                              <SelectItem value="equityType">
                                Equity Type
                              </SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="time">Time</SelectItem>
                              <SelectItem value="brokerage">
                                Brokerage
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex}>{value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center">
                <span>Showing preview of first 5 rows</span>
                <span>Default brokerage: ₹{defaultBrokerage}</span>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={importing || !file}>
            {importing ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
