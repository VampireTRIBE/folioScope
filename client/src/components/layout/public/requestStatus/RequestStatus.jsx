import requestStatusStyle from "./requeststatus.module.css";

const RequestStatus = ({
  name,
  isPending,
  isSuccess,
  isError,
  error,
  respData,
}) => {
  return (
    <div className={requestStatusStyle.container}>
      <h2 className={requestStatusStyle.title}>{name ?? "Request Name"}</h2>
      <div className={requestStatusStyle.content}>
        <div className={requestStatusStyle.status}>
          <div
            className={`${requestStatusStyle.statusLebal} ${isPending ? requestStatusStyle.pending : ""} ${isSuccess ? requestStatusStyle.success : ""} ${isError ? requestStatusStyle.error : ""}`}>
            Status :
          </div>
          {isPending && <p>Verifying...</p>}
          {isSuccess && <p>Verified...</p>}
          {isError && <p>Failed...</p>}
        </div>

        <div className={requestStatusStyle.status}>
          <div
            className={`${requestStatusStyle.statusLebal} ${isPending ? requestStatusStyle.pending : ""} ${isSuccess ? requestStatusStyle.success : ""} ${isError ? requestStatusStyle.error : ""}`}>
            Message :{" "}
          </div>
          {isSuccess && <p>{respData?.message || "Request Success"} ✅</p>}

          {isError && (
            <p>{error?.response?.data?.message || "Request Failed"}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestStatus;
