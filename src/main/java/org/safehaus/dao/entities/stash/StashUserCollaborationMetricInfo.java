package org.safehaus.dao.entities.stash;


import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

import org.safehaus.dao.entities.UserMetricInfo;

import com.impetus.kundera.index.Index;
import com.impetus.kundera.index.IndexCollection;

import static org.safehaus.Constants.DATABASE_SCHEMA;

/**
 * Created by neslihan on 11.09.2015.
 */
@Entity
@Table( name = "user_collaboration_metric_info", schema = DATABASE_SCHEMA )
@IndexCollection( columns = {
        @Index( name = "developer_month_info" )})
public class StashUserCollaborationMetricInfo implements Serializable {
    @EmbeddedId
    @Column(name = "developer_month_info")
    private UserMetricInfo.UserMonthInfo developerMonthInfo;

    @Column(name = "stashCollaborationCount")
    private Integer stashCollaborationCount;

    public StashUserCollaborationMetricInfo(){}

    public UserMetricInfo.UserMonthInfo getDeveloperMonthInfo()
    {
        return developerMonthInfo;
    }

    public Integer getStashCollaborationCount()
    {
        return stashCollaborationCount;
    }

    public void setDeveloperMonthInfo(UserMetricInfo.UserMonthInfo developerMonthInfo)
    {
        this.developerMonthInfo = developerMonthInfo;
    }

    public void setStashCollaborationCount(Integer stashCollaborationCount)
    {
        this.stashCollaborationCount = stashCollaborationCount;
    }


    public static class StashUserCollaborationMetricInfoInternal implements Serializable{

        private String  developerId;

        private long metricMonthTimestamp;

        private Integer stashCollaborationCount;

        public Integer getStashCollaborationCount()
        {
            return stashCollaborationCount;
        }

        public String getDeveloperId() {
            return developerId;
        }

        public long getMetricMonthTimestamp() {
            return metricMonthTimestamp;
        }

        public void setDeveloperId(String developerId) {
            this.developerId = developerId;
        }

        public void setMetricMonthTimestamp(long metricMonthTimestamp) {
            this.metricMonthTimestamp = metricMonthTimestamp;
        }

        public void setStashCollaborationCount(Integer stashCollaborationCount)
        {
            this.stashCollaborationCount = stashCollaborationCount;
        }
    }

}
