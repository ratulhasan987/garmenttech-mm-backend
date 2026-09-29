import dayjs from "dayjs";

interface TaskEntry {
  id: number;
  creatorId: number;
  company: string;
  department: string;
  task: string;
  progress: string;
  qty: number;
  startTime: string;
  endTime: string;
  deliveryTime: string;
  status: "complete" | "pending" | "in_progress";
  nature: "new" | "repeat";
  created_at: Date;
  updated_at: Date;
  creator?: {
    id: number;
    employeeId: string;
    name: string;
    imageUrl: string;
  };
}

type ActivitiesProps = {
  activities: TaskEntry[];
};

const stringToNumber = (str: string) => Number(str.replace(/,/g, ""));
const getProgressColor = (progress: number) => {
  if (progress < 30) return "#dc3545"; // red
  if (progress < 70) return "#ffc107"; // yellow
  return "#28a745"; // green
};

const Activities = ({ activities }: ActivitiesProps) => {
  return (
    <div className="card rounded-15" style={{ minHeight: "600px" }}>
      <div className="card-header d-flex justify-content-between">
        <h5 className="m-0 fs-18 fw-semi-bold text-color-1">
          Performance Overview
        </h5>
        <a href="">
          See All{" "}
          <svg
            width="11"
            height="8"
            viewBox="0 0 11 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 4H10M10 4L6.75 1M10 4L6.75 7"
              stroke="#00B074"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </a>
      </div>
      <div className="card-body p-3">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Task</th>
              <th>progress</th>
            </tr>
          </thead>
          <tbody>
            {activities?.map((activity) => (
              <tr style={{ border: "1px solid #e9edf1" }}>
                <td>{activity?.creator?.name}</td>
                <td>
                  {dayjs(activity?.created_at).format("dddd, MMMM DD, YYYY")}
                </td>
                <td>{activity?.task}</td>
                <td className="align-middle">
                  <div className="form-group">
                    <label htmlFor="">
                      Progress <span id="rangeValue">{activity?.progress}</span>
                      %
                    </label>
                    <div
                      id="progressContainer"
                      className="progress sm-progress-bar"
                    >
                      <div
                        id="progressBar"
                        className="progress-bar"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{
                          width: `${stringToNumber(activity?.progress as string) ?? 100}%`,
                          backgroundColor:
                            getProgressColor(
                              stringToNumber(activity?.progress as string),
                            ) ?? "#28a745",
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="py-2"></div>
      </div>
    </div>
  );
};

export default Activities;
